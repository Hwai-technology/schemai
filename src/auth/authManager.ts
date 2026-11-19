/** Minimal session shape the AuthManager reads from `vscode.AuthenticationSession`. */
export interface AuthSession {
  readonly accessToken: string;
  /** GitHub account; `label` is the user name shown in VS Code's Accounts menu. */
  readonly account?: { readonly label: string };
}

/** The part of `vscode.authentication` the AuthManager needs, so tests can inject a fake. */
export interface AuthenticationApi {
  getSession(
    providerId: string,
    scopes: readonly string[],
    options: { createIfNone?: boolean; silent?: boolean }
  ): Thenable<AuthSession | undefined>;
}

/** The part of `vscode.window` used to warn the user. */
export interface WarningPresenter {
  showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined>;
}

/** Pass the `vscode` module itself in production, a fake in tests. */
export interface AuthManagerDeps {
  readonly authentication: AuthenticationApi;
  readonly window?: WarningPresenter;
}

export const SIGN_IN_BUTTON = 'Sign in';

/**
 * Reads the GitHub session from VS Code's built-in authentication provider.
 * The token lives only in VS Code's session store: it is never written to settings.
 */
export class AuthManager {
  private static readonly PROVIDER_ID = 'github';
  private static readonly SCOPES: readonly string[] = ['read:user'];

  /** Set by `signOut()`: SchemAI ignores the VS Code session until the user signs in again. */
  private signedOut = false;
  private readonly sessionListeners = new Set<() => void>();

  constructor(private readonly deps: AuthManagerDeps) {}

  /** Called after SchemAI signs in or out. Returns a disposable that removes the listener. */
  public onDidChangeSession(listener: () => void): { dispose(): void } {
    this.sessionListeners.add(listener);
    return { dispose: () => this.sessionListeners.delete(listener) };
  }

  /** The existing GitHub session SchemAI may use, or `undefined` if there is none. Never prompts. */
  public async getCurrentSession(): Promise<AuthSession | undefined> {
    if (this.signedOut) {
      return undefined;
    }
    return this.deps.authentication.getSession(
      AuthManager.PROVIDER_ID,
      AuthManager.SCOPES,
      { createIfNone: false, silent: true }
    );
  }

  /** Token of the existing GitHub session, or `undefined` if there is none. Never prompts. */
  public async getAccessToken(): Promise<string | undefined> {
    return (await this.getCurrentSession())?.accessToken;
  }

  /**
   * Runs `action` (e.g. the GitHub search of an analysis) only if there is a session.
   * Without one it warns the user with a "Sign in" button, skips `action` and returns `undefined`.
   */
  public async withSession<T>(action: (token: string) => Promise<T>): Promise<T | undefined> {
    const token = await this.getAccessToken();
    if (token) {
      return action(token);
    }

    const choice = await this.deps.window?.showWarningMessage(
      'SchemAI: sign in to GitHub to search for the origin of pasted code.',
      SIGN_IN_BUTTON
    );
    if (choice === SIGN_IN_BUTTON) {
      try {
        await this.signIn();
      } catch {
        // The user cancelled the sign-in: nothing else to do.
      }
    }
    return undefined;
  }

  /** Asks VS Code for a GitHub session, prompting the user to sign in if there is none. */
  public async signIn(): Promise<boolean> {
    const session = await this.deps.authentication.getSession(
      AuthManager.PROVIDER_ID,
      AuthManager.SCOPES,
      { createIfNone: true }
    );
    this.signedOut = !session;
    this.fireSessionChanged();
    return !!session;
  }

  /**
   * Clears the session for SchemAI. Extensions cannot remove VS Code's own GitHub
   * session, so SchemAI stops using it until the next `signIn()`.
   */
  public signOut(): void {
    this.signedOut = true;
    this.fireSessionChanged();
  }

  private fireSessionChanged(): void {
    this.sessionListeners.forEach((listener) => listener());
  }
}
