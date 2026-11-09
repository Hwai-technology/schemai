import * as vscode from 'vscode';

/**
 * Reference Code for Yusuf (HU-03)
 * Secure credential storage using VS Code ExtensionContext.secrets.
 */
export class SecretStorageManager {
  private static instance: SecretStorageManager;
  private secretStorage: vscode.SecretStorage;

  private static readonly KEYS = {
    GITHUB_PAT: 'schemaAI.githubPAT',
    LLM_API_KEY: 'schemaAI.llmApiKey'
  };

  private constructor(secretStorage: vscode.SecretStorage) {
    this.secretStorage = secretStorage;
  }

  public static initialize(secretStorage: vscode.SecretStorage): SecretStorageManager {
    if (!SecretStorageManager.instance) {
      SecretStorageManager.instance = new SecretStorageManager(secretStorage);
    }
    return SecretStorageManager.instance;
  }

  public static getInstance(): SecretStorageManager {
    if (!SecretStorageManager.instance) {
      throw new Error('SecretStorageManager is not initialized.');
    }
    return SecretStorageManager.instance;
  }

  public async setGitHubPAT(token: string): Promise<void> {
    await this.secretStorage.store(SecretStorageManager.KEYS.GITHUB_PAT, token.trim());
  }

  public async getGitHubPAT(): Promise<string | undefined> {
    return await this.secretStorage.get(SecretStorageManager.KEYS.GITHUB_PAT);
  }

  public async deleteGitHubPAT(): Promise<void> {
    await this.secretStorage.delete(SecretStorageManager.KEYS.GITHUB_PAT);
  }

  public async migrateLegacySettingsToken(): Promise<void> {
    const config = vscode.workspace.getConfiguration('schemaAI');
    const legacyToken = config.get<string>('githubToken');

    if (legacyToken && legacyToken.trim().length > 0) {
      const existing = await this.getGitHubPAT();
      if (!existing) {
        await this.setGitHubPAT(legacyToken.trim());
      }
    }
  }
}

