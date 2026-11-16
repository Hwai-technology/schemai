import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { AuthManager } from '../../auth/authManager';
import { LLMClient } from '../../llm/llmClient';
import { SecretStorageService } from '../../security/secretStorage';
import { TokenStore } from '../../security/tokens';

/**
 * GitHub token formats: ghp_ (personal access token), gho_ (OAuth), plus ghu_/ghs_/ghr_.
 * The fake tokens are built at runtime so that no token-shaped literal is ever committed.
 */
const TOKEN_PATTERN = /gh[pousr]_[A-Za-z0-9]{36}/;
const FAKE_GHP = 'ghp_' + 'F'.repeat(36);
const FAKE_GHO = 'gho_' + 'O'.repeat(36);

class FakeSecretStorage {
  public readonly data = new Map<string, string>();
  async get(key: string) {
    return this.data.get(key);
  }
  async store(key: string, value: string) {
    this.data.set(key, value);
  }
  async delete(key: string) {
    this.data.delete(key);
  }
}

/** Fake `schemaAI` settings: everything written to settings ends up in `values`. */
class FakeSettings {
  public readonly values = new Map<string, unknown>();
  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }
  async update(key: string, value: unknown) {
    if (value === undefined) {
      this.values.delete(key);
    } else {
      this.values.set(key, value);
    }
  }
  /** Serialized settings, as they would be written to settings.json. */
  dump(): string {
    return JSON.stringify(Object.fromEntries(this.values));
  }
}

/** Captures everything written to the console (the extension host log) while `fn` runs. */
async function captureConsole(fn: () => Promise<void>): Promise<string> {
  const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
  const originals = methods.map((m) => console[m]);
  const lines: string[] = [];
  methods.forEach((m) => {
    console[m] = (...args: unknown[]) => {
      lines.push(args.map(String).join(' '));
    };
  });
  try {
    await fn();
  } finally {
    methods.forEach((m, i) => (console[m] = originals[i]));
  }
  return lines.join('\n');
}

/** Every file under `dir` (recursively), skipping build output and dependencies. */
function listFiles(dir: string): string[] {
  const skip = new Set(['node_modules', 'out', '.git', '.vscode-test']);
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return skip.has(entry.name) ? [] : listFiles(full);
    }
    return [full];
  });
}

function setup() {
  const secrets = new FakeSecretStorage();
  const settings = new FakeSettings();
  const tokens = new TokenStore(new SecretStorageService(secrets), settings);
  return { secrets, settings, tokens };
}

describe('No token leak (HU-03 T3)', () => {
  it('the leak detector itself recognises ghp_ and gho_ tokens', () => {
    assert.ok(TOKEN_PATTERN.test(FAKE_GHP));
    assert.ok(TOKEN_PATTERN.test(FAKE_GHO));
    assert.ok(!TOKEN_PATTERN.test('fake-token-for-tests'));
  });

  it('after storing GitHub tokens, settings contain no ghp_/gho_ token and the tokens are in SecretStorage', async () => {
    const { secrets, settings, tokens } = setup();

    await tokens.setGitHubToken(FAKE_GHP);
    await tokens.setLlmApiKey(FAKE_GHO);

    assert.ok(!TOKEN_PATTERN.test(settings.dump()), 'a token was written to settings');
    assert.deepStrictEqual([...secrets.data.values()].sort(), [FAKE_GHO, FAKE_GHP].sort());
  });

  it('after migrating the plain-text schemaAI.githubToken setting, settings contain no token', async () => {
    const { settings, tokens } = setup();
    settings.values.set('githubToken', FAKE_GHP);

    await tokens.migrateLegacyGitHubToken();

    assert.ok(!TOKEN_PATTERN.test(settings.dump()), 'the legacy token is still in settings');
    assert.strictEqual(await tokens.getGitHubToken(), FAKE_GHP);
  });

  it('storing, reading and using tokens writes no ghp_/gho_ token to the log', async () => {
    const { tokens, settings } = setup();
    const auth = new AuthManager({
      authentication: {
        getSession: async () => ({ accessToken: FAKE_GHO })
      }
    });
    const llm = new LLMClient(
      { post: async () => Promise.reject(new Error('network down')) },
      tokens,
      1
    );

    const log = await captureConsole(async () => {
      settings.values.set('githubToken', FAKE_GHP);
      await tokens.migrateLegacyGitHubToken();
      await tokens.setLlmApiKey(FAKE_GHO);
      await tokens.getGitHubToken();
      await auth.signIn();
      await auth.getAccessToken();
      auth.signOut();
      await auth.getAccessToken();
      await llm.explain('const x = 1;', {});
      await tokens.setGitHubToken('   ').catch((e: Error) => console.error(e.message));
    });

    assert.ok(!TOKEN_PATTERN.test(log), `a token was logged:\n${log}`);
  });

  it('no ghp_/gho_ token is committed in the source, config or CI files', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const files = [
      ...listFiles(path.join(repoRoot, 'src')),
      ...listFiles(path.join(repoRoot, '.github')),
      path.join(repoRoot, 'package.json'),
      path.join(repoRoot, 'tsconfig.json')
    ].filter((f) => fs.existsSync(f));

    const leaks = files.filter((f) => TOKEN_PATTERN.test(fs.readFileSync(f, 'utf8')));

    assert.ok(files.length > 0, 'no files were scanned');
    assert.deepStrictEqual(leaks.map((f) => path.relative(repoRoot, f)), []);
  });
});
