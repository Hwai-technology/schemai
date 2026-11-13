import type * as vscode from 'vscode';
import type { AuthManager } from './authManager';
import { DISCONNECT_COMMAND, LOGIN_COMMAND } from './commands';

/** The part of `vscode.StatusBarItem` used here, so tests can inject a fake. */
export interface StatusBarItemLike {
  text: string;
  tooltip?: string | vscode.MarkdownString;
  command?: string | vscode.Command;
  show(): void;
  dispose(): void;
}

/** The part of `vscode.authentication` that reports session changes. */
export interface SessionChangeSource {
  onDidChangeSessions(listener: (e: { provider: { id: string } }) => unknown): { dispose(): unknown };
}

export const NOT_CONNECTED_TEXT = 'GitHub: not connected';

/** Shows which GitHub account SchemAI uses (click to sign in / out), and keeps it up to date. */
export class AuthStatusBar {
  private readonly subscriptions: { dispose(): unknown }[];

  constructor(
    private readonly item: StatusBarItemLike,
    private readonly authManager: Pick<AuthManager, 'getCurrentSession' | 'onDidChangeSession'>,
    sessions: SessionChangeSource
  ) {
    this.subscriptions = [
      sessions.onDidChangeSessions((e) => {
        if (e.provider.id === 'github') {
          void this.refresh();
        }
      }),
      authManager.onDidChangeSession(() => void this.refresh())
    ];
    item.show();
  }

  public async refresh(): Promise<void> {
    const session = await this.authManager.getCurrentSession();
    if (session) {
      const account = session.account?.label ?? 'connected';
      this.item.text = `GitHub: ${account}`;
      this.item.tooltip = `SchemAI is using the GitHub account ${account}. Click to sign out.`;
      this.item.command = DISCONNECT_COMMAND;
    } else {
      this.item.text = NOT_CONNECTED_TEXT;
      this.item.tooltip = 'SchemAI is not connected to GitHub. Click to sign in.';
      this.item.command = LOGIN_COMMAND;
    }
  }

  public dispose(): void {
    this.subscriptions.forEach((s) => s.dispose());
    this.item.dispose();
  }
}
