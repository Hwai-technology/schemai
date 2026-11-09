import * as vscode from 'vscode';

export interface GitHubUser {
  id: string;
  login: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: GitHubUser;
  accessToken?: string;
}

/**
 * Reference Code for Yusuf (HU-02)
 * Manages VS Code GitHub Authentication sessions.
 */
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

  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    await this.refreshSession(false);

    const disposable = vscode.authentication.onDidChangeSessions(async e => {
      if (e.provider.id === 'github') {
        await this.refreshSession(false);
      }
    });

    context.subscriptions.push(disposable, this.onAuthStateChangedEmitter);
  }

  public async refreshSession(createIfNone = false): Promise<vscode.AuthenticationSession | undefined> {
    try {
      this.currentSession = await vscode.authentication.getSession('github', AuthManager.SCOPES, {
        createIfNone
      });
      this.emitAuthState();
      return this.currentSession;
    } catch {
      this.currentSession = undefined;
      this.emitAuthState();
      return undefined;
    }
  }

  public async login(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      const session = await vscode.authentication.getSession('github', AuthManager.SCOPES, {
        createIfNone: true
      });
      if (session) {
        this.currentSession = session;
        this.emitAuthState();
        vscode.window.showInformationMessage(`SchemAI: Signed in as @${session.account.label}.`);
        return session;
      }
    } catch {
      vscode.window.showErrorMessage('SchemAI: GitHub sign-in failed.');
    }
    return undefined;
  }

  public async disconnect(): Promise<void> {
    this.currentSession = undefined;
    this.emitAuthState();
    vscode.window.showInformationMessage('SchemAI: Disconnected from GitHub.');
  }

  public async getAccessToken(): Promise<string | undefined> {
    if (!this.currentSession) {
      await this.refreshSession(false);
    }
    return this.currentSession?.accessToken;
  }

  public isAuthenticated(): boolean {
    return !!this.currentSession;
  }

  private emitAuthState(): void {
    const user = this.currentSession ? { id: this.currentSession.account.id, login: this.currentSession.account.label } : undefined;
    this.onAuthStateChangedEmitter.fire({
      isAuthenticated: this.isAuthenticated(),
      user,
      accessToken: this.currentSession?.accessToken
    });
  }
}
