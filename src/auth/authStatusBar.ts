import type * as vscode from 'vscode';
import type { AuthManager } from './authManager';

/** The part of `vscode.StatusBarItem` used here, so tests can inject a fake. */
export interface StatusBarItemLike {
  text: string;
  tooltip?: string | vscode.MarkdownString;
  show(): void;
  dispose(): void;
}

/** The part of `vscode.authentication` that reports session changes. */
export interface SessionChangeSource {
  onDidChangeSessions(listener: (e: { provider: { id: string } }) => unknown): { dispose(): unknown };
}

export const CONNECTED_TEXT = 'GitHub: connected';
export const NOT_CONNECTED_TEXT = 'GitHub: not connected';

/** Shows whether SchemAI has a GitHub session, and keeps it up to date. */
export class AuthStatusBar {
  private readonly subscriptions: { dispose(): unknown }[];

  constructor(
    private readonly item: StatusBarItemLike,
    private readonly authManager: Pick<AuthManager, 'getAccessToken' | 'onDidChangeSession'>,
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
    const connected = !!(await this.authManager.getAccessToken());
    this.item.text = connected ? CONNECTED_TEXT : NOT_CONNECTED_TEXT;
    this.item.tooltip = connected
      ? 'SchemAI is using your GitHub session'
      : 'SchemAI: run "SchemAI: Sign in" to connect GitHub';
  }

  public dispose(): void {
    this.subscriptions.forEach((s) => s.dispose());
    this.item.dispose();
  }
}
