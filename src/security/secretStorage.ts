import type * as vscode from 'vscode';

export interface ISecurityService {
  storeSecret(key: string, value: string): Promise<void>;
  getSecret(key: string): Promise<string | undefined>;
  deleteSecret(key: string): Promise<void>;
}

/** The part of `context.secrets` this wrapper needs, so tests can inject a fake. */
export type SecretStore = Pick<vscode.SecretStorage, 'get' | 'store' | 'delete'>;

/**
 * Thin wrapper over VS Code's SecretStorage (`context.secrets`).
 * Values are encrypted by the OS keychain and never written to settings.
 */
export class SecretStorageService implements ISecurityService {
  constructor(private readonly secrets: SecretStore) {}

  public async storeSecret(key: string, value: string): Promise<void> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error(`SchemAI: refusing to store an empty secret for "${key}".`);
    }
    await this.secrets.store(key, trimmed);
  }

  public async getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key);
  }

  public async deleteSecret(key: string): Promise<void> {
    await this.secrets.delete(key);
  }
}
