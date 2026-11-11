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

  /** Set by `signOut()`: SchemAI ignores the VS Code session until the user signs in again. */
  private signedOut = false;

  constructor(private readonly deps: AuthManagerDeps) {}

  /** Token of the existing GitHub session, or `undefined` if there is none. Never prompts. */
  public async getAccessToken(): Promise<string | undefined> {
    if (this.signedOut) {
      return undefined;
    }
    const session = await this.deps.authentication.getSession(
      AuthManager.PROVIDER_ID,
      AuthManager.SCOPES,
      { createIfNone: false, silent: true }
    );
    return session?.accessToken;
  }

  /** Asks VS Code for a GitHub session, prompting the user to sign in if there is none. */
  public async signIn(): Promise<boolean> {
    const session = await this.deps.authentication.getSession(
      AuthManager.PROVIDER_ID,
      AuthManager.SCOPES,
      { createIfNone: true }
    );
    this.signedOut = !session;
    return !!session;
  }

  /**
   * Clears the session for SchemAI. Extensions cannot remove VS Code's own GitHub
   * session, so SchemAI stops using it until the next `signIn()`.
   */
  public signOut(): void {
    this.signedOut = true;
  }
}
