import * as vscode from 'vscode';
import { AuthManager } from './authManager';
import { AuthState } from '../types';

export class AuthStatusBarItem {
  private statusBarItem: vscode.StatusBarItem;
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'schemaAI.manageAccount';

    // Subscribe to auth state updates
    this.authManager.onAuthStateChanged((state: AuthState) => {
      this.updateState(state);
    });

    // Initial update
    this.updateState({
      isAuthenticated: this.authManager.isAuthenticated(),
      user: this.authManager.getCurrentUser()
    });

    this.statusBarItem.show();
  }

  public updateState(state: AuthState): void {
    if (state.isAuthenticated && state.user) {
      this.statusBarItem.text = `$(github) SchemAI: @${state.user.login}`;
      this.statusBarItem.tooltip = `SchemAI: Authenticated with GitHub as ${state.user.login}. Click to manage account.`;
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = `$(github) SchemAI: Connect GitHub`;
      this.statusBarItem.tooltip = `SchemAI: Click to connect your personal GitHub account to avoid rate limits.`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
  }

  public async showAccountMenu(): Promise<void> {
    if (this.authManager.isAuthenticated()) {
      const user = this.authManager.getCurrentUser();
      const selection = await vscode.window.showQuickPick(
        [
          {
            label: `$(account) Connected as @${user?.login}`,
            description: 'Active personal GitHub session',
            action: 'noop'
          },
          {
            label: '$(sync) Switch GitHub Account',
            description: 'Sign in with a different account',
            action: 'switch'
          },
          {
            label: '$(sign-out) Disconnect from SchemAI',
            description: 'Clear local session reference',
            action: 'disconnect'
          }
        ],
        { placeHolder: 'SchemAI GitHub Account Management' }
      );

      if (selection?.action === 'switch') {
        await this.authManager.switchAccount();
      } else if (selection?.action === 'disconnect') {
        await this.authManager.disconnect();
      }
    } else {
      const selection = await vscode.window.showQuickPick(
        [
          {
            label: '$(sign-in) Sign in with GitHub',
            description: 'Connect personal GitHub account to avoid API rate limits',
            action: 'login'
          }
        ],
        { placeHolder: 'SchemAI GitHub Authentication' }
      );

      if (selection?.action === 'login') {
        await this.authManager.login();
      }
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}

