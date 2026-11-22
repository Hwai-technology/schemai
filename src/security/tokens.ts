import type { ISecurityService } from './secretStorage';

/** The part of `vscode.workspace.getConfiguration('schemaAI')` needed here, so tests can inject a fake. */
export interface SettingsSection {
  get<T>(key: string): T | undefined;
  /** `configurationTarget`: `true` = user (global) settings, `false` = workspace settings. */
  update(key: string, value: unknown, configurationTarget?: boolean): Thenable<void>;
}

/** SecretStorage keys: each token has its own key so one never overwrites the other. */
export const SECRET_KEYS = {
  githubToken: 'schemaAI.githubToken',
  llmApiKey: 'schemaAI.llmApiKey'
} as const;

/** Old plain-text setting (`schemaAI.githubToken`) that must not keep holding a token. */
const LEGACY_GITHUB_SETTING = 'githubToken';

/** Stores and retrieves the GitHub token and the LLM API key in SecretStorage. */
export class TokenStore {
  constructor(
    private readonly security: ISecurityService,
    private readonly settings: SettingsSection
  ) {}

  public setGitHubToken(token: string): Promise<void> {
    return this.security.storeSecret(SECRET_KEYS.githubToken, token);
  }

  public getGitHubToken(): Promise<string | undefined> {
    return this.security.getSecret(SECRET_KEYS.githubToken);
  }

  public setLlmApiKey(key: string): Promise<void> {
    return this.security.storeSecret(SECRET_KEYS.llmApiKey, key);
  }

  public getLlmApiKey(): Promise<string | undefined> {
    return this.security.getSecret(SECRET_KEYS.llmApiKey);
  }

  /**
   * Moves a token left in the plain-text `schemaAI.githubToken` setting into SecretStorage
   * (unless a secret already exists) and removes the setting.
   */
  public async migrateLegacyGitHubToken(): Promise<void> {
    const legacy = this.settings.get<string>(LEGACY_GITHUB_SETTING);
    if (legacy === undefined) {
      return;
    }

    if (legacy.trim().length > 0 && !(await this.getGitHubToken())) {
      await this.setGitHubToken(legacy);
    }

    for (const global of [true, false]) {
      try {
        await this.settings.update(LEGACY_GITHUB_SETTING, undefined, global);
      } catch {
        // No workspace open: there are no workspace settings to clean.
      }
    }
  }
}
