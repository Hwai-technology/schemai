import type * as vscode from 'vscode';
import type { AuthManager } from './authManager';

/** The part of `vscode.commands` needed here, so tests can inject a fake. */
export interface CommandRegistry {
  registerCommand(id: string, handler: (...args: any[]) => unknown): vscode.Disposable;
}

export const LOGIN_COMMAND = 'schemaAI.login';
export const DISCONNECT_COMMAND = 'schemaAI.disconnect';

/** Registers the GitHub sign-in and sign-out commands. Push the result into `context.subscriptions`. */
export function registerAuthCommands(
  commands: CommandRegistry,
  authManager: Pick<AuthManager, 'signIn' | 'signOut'>
): vscode.Disposable[] {
  return [
    commands.registerCommand(LOGIN_COMMAND, () => authManager.signIn()),
    commands.registerCommand(DISCONNECT_COMMAND, () => authManager.signOut())
  ];
}
