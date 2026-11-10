import 'mocha';
import * as assert from 'assert';
import { SecretStorageService } from '../../security/secretStorage';

/**
 * In-memory stand-in for `context.secrets` (vscode.SecretStorage).
 * Only fake values are used in these tests: never real tokens.
 */
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

const FAKE_TOKEN = 'fake-token-for-tests';

describe('SecretStorageService (HU-03 T1)', () => {
  let secrets: FakeSecretStorage;
  let service: SecretStorageService;

  beforeEach(() => {
    secrets = new FakeSecretStorage();
    service = new SecretStorageService(secrets);
  });

  it('stores a token in the injected context.secrets', async () => {
    await service.storeSecret('schemaAI.test', FAKE_TOKEN);

    assert.strictEqual(secrets.data.get('schemaAI.test'), FAKE_TOKEN);
  });

  it('gets a stored token back', async () => {
    await service.storeSecret('schemaAI.test', FAKE_TOKEN);

    assert.strictEqual(await service.getSecret('schemaAI.test'), FAKE_TOKEN);
  });

  it('returns undefined for a key that was never stored', async () => {
    assert.strictEqual(await service.getSecret('schemaAI.missing'), undefined);
  });

  it('deletes a stored token', async () => {
    await service.storeSecret('schemaAI.test', FAKE_TOKEN);

    await service.deleteSecret('schemaAI.test');

    assert.strictEqual(await service.getSecret('schemaAI.test'), undefined);
    assert.strictEqual(secrets.data.has('schemaAI.test'), false);
  });

  it('rejects an empty token and stores nothing', async () => {
    await assert.rejects(() => service.storeSecret('schemaAI.test', ''));

    assert.strictEqual(secrets.data.has('schemaAI.test'), false);
  });

  it('rejects a whitespace-only token and stores nothing', async () => {
    await assert.rejects(() => service.storeSecret('schemaAI.test', '   '));

    assert.strictEqual(secrets.data.has('schemaAI.test'), false);
  });
});
