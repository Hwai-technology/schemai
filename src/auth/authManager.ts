import * as vscode from 'vscode';
import { AuthState, GitHubUser } from '../types';

export class AuthManager {
  private static instance: AuthManager;
  private currentSession: vscode.AuthenticationSession | undefined;
  private onAuthStateChangedEmitter = new vscode.EventEmitter<AuthState>();
  public readonly onAuthStateChanged = this.onAuthStateChangedEmitter.event;

  private static readonly SCOPES = ['read:user'];

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Initializes authentication and registers session change listener
   */
  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    // Check initial active session silently
    await this.refreshSession(false);

    // Subscribe to VS Code Authentication session changes
    const disposable = vscode.authentication.onDidChangeSessions(async (e) => {
      if (e.provider.id === 'github') {
        await this.refreshSession(false);
      }
    });

    context.subscriptions.push(disposable, this.onAuthStateChangedEmitter);
  }

  /**
   * Refreshes active session state
   */
  public async refreshSession(createIfNone = false): Promise<vscode.AuthenticationSession | undefined> {
    try {
      this.currentSession = await vscode.authentication.getSession('github', AuthManager.SCOPES, {
        createIfNone
      });

      this.emitAuthState();
      return this.currentSession;
    } catch (error) {
      this.currentSession = undefined;
      this.emitAuthState();
      return undefined;
    }
  }

  /**
   * Interactive GitHub login (HU-02-T1 & HU-02-T2)
   */
  public async login(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      const session = await vscode.authentication.getSession('github', AuthManager.SCOPES, {
        createIfNone: true
      });

      if (session) {
        this.currentSession = session;
        this.emitAuthState();
        vscode.window.showInformationMessage(
          `SchemAI: Successfully signed in to GitHub as @${session.account.label}.`
        );
        return session;
      }
    } catch (err) {
      vscode.window.showErrorMessage(`SchemAI: GitHub authentication failed or was cancelled.`);
    }
    return undefined;
  }

  /**
   * Interactive GitHub account switching (HU-02-T2)
   */
  public async switchAccount(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      const session = await vscode.authentication.getSession('github', AuthManager.SCOPES, {
        forceNewSession: true
      });

      if (session) {
        this.currentSession = session;
        this.emitAuthState();
        vscode.window.showInformationMessage(
          `SchemAI: Switched GitHub account to @${session.account.label}.`
        );
        return session;
      }
    } catch (err) {
      vscode.window.showErrorMessage(`SchemAI: Failed to switch GitHub account.`);
    }
    return undefined;
  }

  /**
   * Disconnects the active session reference for SchemAI
   */
  public async disconnect(): Promise<void> {
    this.currentSession = undefined;
    this.emitAuthState();
    vscode.window.showInformationMessage(
      'SchemAI: Disconnected from GitHub. To completely remove the session from VS Code, use the Accounts menu.'
    );
  }

  /**
   * Returns active token or undefined
   */
  public async getAccessToken(): Promise<string | undefined> {
    if (!this.currentSession) {
      await this.refreshSession(false);
    }
    return this.currentSession?.accessToken;
  }

  /**
   * Returns current user details if authenticated
   */
  public getCurrentUser(): GitHubUser | undefined {
    if (!this.currentSession) return undefined;
    return {
      id: this.currentSession.account.id,
      login: this.currentSession.account.label
    };
  }

  public isAuthenticated(): boolean {
    return !!this.currentSession;
  }

  /**
   * HU-02-T4: Warn user if no session is active before performing analysis
   */
  public async warnIfNoSessionBeforeAnalysis(): Promise<boolean> {
    if (this.isAuthenticated()) {
      return true;
    }

    const action = await vscode.window.showWarningMessage(
      'SchemAI: You are not connected to GitHub. Public API rate limits (60 req/h) may apply.',
      'Connect GitHub',
      'Continue Anonymously'
    );

    if (action === 'Connect GitHub') {
      const session = await this.login();
      return !!session;
    }

    return true; // continue anonymously if chosen
  }

  private emitAuthState(): void {
    const user = this.getCurrentUser();
    this.onAuthStateChangedEmitter.fire({
      isAuthenticated: this.isAuthenticated(),
      user,
      accessToken: this.currentSession?.accessToken
    });
  }
}

