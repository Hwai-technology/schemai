import * as vscode from 'vscode';

/**
 * Reference Code for Ahmet (COORD)
 * Coordinates command registration and feature activation life-cycle.
 */
export function registerCommands(context: vscode.ExtensionContext, analysisQueue: any): void {
  // Manual analysis on active text selection (HU-06)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.analyzeSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showInformationMessage('SchemAI: Select a block of code to analyze.');
        return;
      }

      const text = editor.document.getText(editor.selection);
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'SchemAI: Scanning selected snippet...',
          cancellable: false
        },
        async () => {
          // Dispatch to analysisQueue immediately
        }
      );
    })
  );

  // Check last pasted code snippet
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.checkLastPasted', async () => {
      // Dispatches request to show last risk card
    })
  );
}

