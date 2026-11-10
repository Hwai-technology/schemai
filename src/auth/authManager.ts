/** Minimal session shape the AuthManager reads from `vscode.AuthenticationSession`. */
export interface AuthSession {
  readonly accessToken: string;
}

/** The part of `vscode.authentication` the AuthManager needs, so tests can inject a fake. */
export interface AuthenticationApi {
  getSession(
    providerId: string,
    scopes: readonly string[],
    options: { createIfNone?: boolean; silent?: boolean }
  ): Thenable<AuthSession | undefined>;
}

/** Pass the `vscode` module itself in production, a fake in tests. */
export interface AuthManagerDeps {
  readonly authentication: AuthenticationApi;
}

/**
 * Reads the GitHub session from VS Code's built-in authentication provider.
 * The token lives only in VS Code's session store: it is never written to settings.
 */
export class AuthManager {
  private static readonly PROVIDER_ID = 'github';
  private static readonly SCOPES: readonly string[] = ['read:user'];

  constructor(private readonly deps: AuthManagerDeps) {}

  /** Token of the existing GitHub session, or `undefined` if there is none. Never prompts. */
  public async getAccessToken(): Promise<string | undefined> {
    const session = await this.deps.authentication.getSession(
      AuthManager.PROVIDER_ID,
      AuthManager.SCOPES,
      { createIfNone: false, silent: true }
    );
    return session?.accessToken;
  }
}
