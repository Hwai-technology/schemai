import 'mocha';
import * as assert from 'assert';
import { AuthManager } from '../../auth/authManager';
import { LLMClient } from '../../llm/llmClient';
import { SecretStorageService } from '../../security/secretStorage';
import { TokenStore } from '../../security/tokens';

/**
 * QA T3: credentials must live only in VS Code's SecretStorage.
 *
 * The fake tokens are assembled at runtime so no token-shaped literal is ever
 * committed, while the detector itself is still exercised with real formats.
 */
const GITHUB_TOKEN_PATTERN = /gh[pousr]_[A-Za-z0-9]{36}/;
const LLM_KEY_PATTERN = /sk-[A-Za-z0-9]{20,}/;

const FAKE_GITHUB_TOKEN = 'ghp_' + 'A'.repeat(36);
const FAKE_OAUTH_TOKEN = 'gho_' + 'B'.repeat(36);
const FAKE_LLM_KEY = 'sk-' + 'C'.repeat(32);

function containsToken(text: string): boolean {
  return GITHUB_TOKEN_PATTERN.test(text) || LLM_KEY_PATTERN.test(text);
}

/** Minimal SecretStorage double: values live in memory, never in settings. */
class FakeSecretStorage {
  public readonly data = new Map<string, string>();

  async get(key: string): Promise<string | undefined> {
    return this.data.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
}

/** Fake `schemaAI` settings; `dump()` is what would be written to settings.json. */
class FakeSettings {
  public readonly values = new Map<string, unknown>();

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  async update(key: string, value: unknown): Promise<void> {
    if (value === undefined) {
      this.values.delete(key);
    } else {
      this.values.set(key, value);
    }
  }

  dump(): string {
    return JSON.stringify(Object.fromEntries(this.values));
  }
}

/** Captures everything written to the console (the extension host log). */
async function captureConsole(fn: () => Promise<void>): Promise<string> {
  const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
  const originals = methods.map((method) => console[method]);
  const lines: string[] = [];

  methods.forEach((method) => {
    console[method] = (...args: unknown[]) => {
      lines.push(args.map(String).join(' '));
    };
  });

  try {
    await fn();
  } finally {
    methods.forEach((method, index) => {
      console[method] = originals[index];
    });
  }

  return lines.join('\n');
}

function setup(): { secrets: FakeSecretStorage; settings: FakeSettings; tokens: TokenStore } {
  const secrets = new FakeSecretStorage();
  const settings = new FakeSettings();
  const tokens = new TokenStore(new SecretStorageService(secrets), settings);
  return { secrets, settings, tokens };
}

describe('QA T3: secrets must not leak', () => {
  it('recognises the credential formats used by the checks', () => {
    assert.ok(GITHUB_TOKEN_PATTERN.test(FAKE_GITHUB_TOKEN));
    assert.ok(GITHUB_TOKEN_PATTERN.test(FAKE_OAUTH_TOKEN));
    assert.ok(LLM_KEY_PATTERN.test(FAKE_LLM_KEY));
    assert.ok(!containsToken('ordinary settings and log text'));
  });

  it('writes the GitHub token and the LLM key to SecretStorage, never to settings', async () => {
    const { secrets, settings, tokens } = setup();

    await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);
    await tokens.setLlmApiKey(FAKE_LLM_KEY);

    assert.strictEqual(settings.dump(), '{}', 'storing tokens must not write any setting');
    assert.ok(!containsToken(settings.dump()), 'a token was written to settings');
    assert.deepStrictEqual(
      [...secrets.data.values()].sort(),
      [FAKE_GITHUB_TOKEN, FAKE_LLM_KEY].sort()
    );
  });

  it('removes a legacy token from settings when migrating it to SecretStorage', async () => {
    const { secrets, settings, tokens } = setup();
    settings.values.set('githubToken', FAKE_OAUTH_TOKEN);

    await tokens.migrateLegacyGitHubToken();

    assert.strictEqual(settings.values.has('githubToken'), false);
    assert.ok(!containsToken(settings.dump()), 'the legacy token is still in settings');
    assert.strictEqual(await tokens.getGitHubToken(), FAKE_OAUTH_TOKEN);
    assert.deepStrictEqual([...secrets.data.values()], [FAKE_OAUTH_TOKEN]);
  });

  it('does not print any credential while authenticating and calling the mocked LLM', async () => {
    const { secrets, settings, tokens } = setup();
    const auth = new AuthManager({
      authentication: {
        getSession: async () => ({
          accessToken: FAKE_OAUTH_TOKEN,
          account: { label: 'qa-tester' }
        })
      }
    });

    let requests = 0;
    const llm = new LLMClient(
      {
        post: async (request) => {
          requests++;
          assert.strictEqual(
            request.headers.Authorization,
            `Bearer ${FAKE_LLM_KEY}`,
            'the LLM client must use the SecretStorage key only in the request header'
          );
          if (requests === 2) {
            // Even an upstream error that echoes the token must not be logged.
            throw new Error(`upstream rejected ${FAKE_LLM_KEY}`);
          }
          return { text: 'safe explanation' };
        }
      },
      tokens
    );

    const log = await captureConsole(async () => {
      await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);
      await tokens.setLlmApiKey(FAKE_LLM_KEY);

      assert.strictEqual(await tokens.getGitHubToken(), FAKE_GITHUB_TOKEN);
      assert.strictEqual(await tokens.getLlmApiKey(), FAKE_LLM_KEY);

      await auth.signIn();
      assert.strictEqual(await auth.getAccessToken(), FAKE_OAUTH_TOKEN);

      const explanation = await llm.explain('const value = 1;', {
        detectedLicense: 'MIT',
        projectLicense: 'MIT'
      });
      assert.strictEqual(explanation, 'safe explanation');

      const fallback = await llm.explain('const value = 2;', {
        detectedLicense: 'GPL-3.0',
        projectLicense: 'MIT'
      });
      assert.ok(fallback.length > 0, 'a failed LLM call must still return a fallback');

      auth.signOut();
    });

    assert.strictEqual(requests, 2, 'both mocked LLM calls must run');
    assert.ok(!containsToken(log), `a token was logged:\n${log}`);
    assert.ok(!containsToken(settings.dump()), 'a token was written to settings');
    assert.deepStrictEqual(
      [...secrets.data.values()].sort(),
      [FAKE_GITHUB_TOKEN, FAKE_LLM_KEY].sort(),
      'the credentials must remain available in SecretStorage'
    );
  });
});
