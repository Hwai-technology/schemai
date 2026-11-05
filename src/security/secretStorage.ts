import * as vscode from 'vscode';

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
      throw new Error('SecretStorageManager is not initialized. Call initialize() in extension activation.');
    }
    return SecretStorageManager.instance;
  }

  /**
   * Securely saves the fallback GitHub PAT
   */
  public async setGitHubPAT(token: string): Promise<void> {
    await this.secretStorage.store(SecretStorageManager.KEYS.GITHUB_PAT, token.trim());
  }

  /**
   * Retrieves the fallback GitHub PAT
   */
  public async getGitHubPAT(): Promise<string | undefined> {
    return await this.secretStorage.get(SecretStorageManager.KEYS.GITHUB_PAT);
  }

  /**
   * Deletes the fallback GitHub PAT
   */
  public async deleteGitHubPAT(): Promise<void> {
    await this.secretStorage.delete(SecretStorageManager.KEYS.GITHUB_PAT);
  }

  /**
   * Securely saves the LLM API Key (OpenAI / Claude / Gemini)
   */
  public async setLLMApiKey(apiKey: string): Promise<void> {
    await this.secretStorage.store(SecretStorageManager.KEYS.LLM_API_KEY, apiKey.trim());
  }

  /**
   * Retrieves the LLM API Key
   */
  public async getLLMApiKey(): Promise<string | undefined> {
    return await this.secretStorage.get(SecretStorageManager.KEYS.LLM_API_KEY);
  }

  /**
   * Deletes the LLM API Key
   */
  public async deleteLLMApiKey(): Promise<void> {
    await this.secretStorage.delete(SecretStorageManager.KEYS.LLM_API_KEY);
  }

  /**
   * Migrates legacy plaintext githubToken from settings to SecretStorage safely
   */
  public async migrateLegacySettingsToken(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('schemaAI');
      const legacyToken = config.get<string>('githubToken');

      if (legacyToken && legacyToken.trim().length > 0) {
        const existingSecureToken = await this.getGitHubPAT();
        if (!existingSecureToken) {
          await this.setGitHubPAT(legacyToken.trim());
        }

        // Inform user to clear plaintext token
        vscode.window.showInformationMessage(
          'SchemAI: Your GitHub Token has been migrated to secure SecretStorage. You can safely remove it from settings.json.'
        );
      }
    } catch (err) {
      console.warn('SchemAI: Legacy token migration check skipped.', err);
    }
  }
}

