import * as vscode from 'vscode';

/**
 * Reference Code for Yunus (HU-10)
 * Extracted from prototype `sourceSearch.ts`.
 * Handles rate limits (HTTP 403 & 429) and cooldown alerts.
 */
export class RateLimitHandler {
  private static warned = false;

  public static isRateLimited(statusCode: number): boolean {
    return statusCode === 403 || statusCode === 429;
  }

  public static notifyRateLimit(): void {
    if (this.warned) return;
    this.warned = true;

    vscode.window
      .showWarningMessage(
        'SchemAI: GitHub API rate limit reached. Sign in with your GitHub account to continue scanning without restrictions.',
        'Sign in to GitHub',
        'Dismiss'
      )
      .then(action => {
        if (action === 'Sign in to GitHub') {
          vscode.commands.executeCommand('schemaAI.login');
        }
      });

    setTimeout(() => {
      this.warned = false;
    }, 60000);
  }
}

