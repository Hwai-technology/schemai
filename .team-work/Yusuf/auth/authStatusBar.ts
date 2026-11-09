import * as vscode from 'vscode';
import { AuthManager } from './authManager';

/**
 * Reference Code for Yusuf (HU-02)
 * Status bar indicator for GitHub account state.
 */
export class AuthStatusBarItem {
  private statusBarItem: vscode.StatusBarItem;
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      90
    );
    this.statusBarItem.command = 'schemaAI.manageAccount';
    this.update();

    authManager.onAuthStateChanged(() => this.update());
    this.statusBarItem.show();
  }

  public update(): void {
    if (this.authManager.isAuthenticated()) {
      const user = this.authManager.getCurrentUser?.();
      this.statusBarItem.text = `$(github) @${user?.login || 'Connected'}`;
      this.statusBarItem.tooltip = 'SchemAI: GitHub Connected (Click to manage)';
    } else {
      this.statusBarItem.text = '$(shield) SchemAI (Sign In)';
      this.statusBarItem.tooltip = 'SchemAI: Sign in to GitHub for unlimited scanning';
    }
  }

  public async showAccountMenu(): Promise<void> {
    if (this.authManager.isAuthenticated()) {
      const selection = await vscode.window.showQuickPick(
        ['Disconnect Account', 'Cancel'],
        { placeHolder: 'SchemAI GitHub Account Options' }
      );
      if (selection === 'Disconnect Account') {
        await this.authManager.disconnect();
      }
    } else {
      await this.authManager.login();
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
