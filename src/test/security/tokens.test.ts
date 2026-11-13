import 'mocha';
import * as assert from 'assert';
import { SecretStorageService } from '../../security/secretStorage';
import { TokenStore } from '../../security/tokens';

/** Fake values only: never real tokens in tests. */
const FAKE_GITHUB_TOKEN = 'fake-github-token-for-tests';
const FAKE_LLM_KEY = 'fake-llm-key-for-tests';
const FAKE_LEGACY_TOKEN = 'fake-legacy-token-for-tests';

/** In-memory stand-in for `context.secrets`. */
class FakeSecretStorage {
  public readonly data = new Map<string, string>();
  public storeCalls = 0;

  async get(key: string): Promise<string | undefined> {
    return this.data.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    this.storeCalls++;
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
}

/**
 * In-memory stand-in for `vscode.workspace.getConfiguration('schemaAI')`.
 * `update(key, undefined)` removes the setting, as in VS Code.
 */
class FakeConfiguration {
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
}

describe('TokenStore (HU-03 T2)', () => {
  let secrets: FakeSecretStorage;
  let config: FakeConfiguration;
  let tokens: TokenStore;

  beforeEach(() => {
    secrets = new FakeSecretStorage();
    config = new FakeConfiguration();
    tokens = new TokenStore(new SecretStorageService(secrets), config);
  });

  describe('GitHub and LLM tokens', () => {
    it('stores the GitHub token and the LLM key under different keys', async () => {
      await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);
      await tokens.setLlmApiKey(FAKE_LLM_KEY);

      assert.strictEqual(secrets.data.size, 2);
      assert.deepStrictEqual(
        [...secrets.data.values()].sort(),
        [FAKE_GITHUB_TOKEN, FAKE_LLM_KEY].sort()
      );
    });

    it('gets each token back from its own key', async () => {
      await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);
      await tokens.setLlmApiKey(FAKE_LLM_KEY);

      assert.strictEqual(await tokens.getGitHubToken(), FAKE_GITHUB_TOKEN);
      assert.strictEqual(await tokens.getLlmApiKey(), FAKE_LLM_KEY);
    });

    it('storing one token does not overwrite the other', async () => {
      await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);

      await tokens.setLlmApiKey(FAKE_LLM_KEY);

      assert.strictEqual(await tokens.getGitHubToken(), FAKE_GITHUB_TOKEN);
    });
  });

  describe('migration of the plain-text schemaAI.githubToken setting', () => {
    it('moves the legacy token to SecretStorage and removes the setting', async () => {
      config.values.set('githubToken', FAKE_LEGACY_TOKEN);

      await tokens.migrateLegacyGitHubToken();

      assert.strictEqual(await tokens.getGitHubToken(), FAKE_LEGACY_TOKEN);
      assert.strictEqual(config.values.has('githubToken'), false);
    });

    it('does nothing when there is no legacy setting', async () => {
      await tokens.migrateLegacyGitHubToken();

      assert.strictEqual(secrets.storeCalls, 0);
      assert.strictEqual(await tokens.getGitHubToken(), undefined);
    });

    it('keeps an existing secret but still removes the legacy setting', async () => {
      await tokens.setGitHubToken(FAKE_GITHUB_TOKEN);
      config.values.set('githubToken', FAKE_LEGACY_TOKEN);

      await tokens.migrateLegacyGitHubToken();

      assert.strictEqual(await tokens.getGitHubToken(), FAKE_GITHUB_TOKEN);
      assert.strictEqual(config.values.has('githubToken'), false);
    });
  });
});
