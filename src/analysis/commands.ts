import type * as vscode from 'vscode';

export const ANALYZE_SELECTION_COMMAND = 'schemaAI.analyzeSelection';
export const ANALYZE_FILE_COMMAND = 'schemaAI.analyzeFile';

export interface CommandRegistry {
  registerCommand(id: string, handler: (...args: any[]) => unknown): vscode.Disposable;
}

export interface TextEditorLike {
  document: {
    getText(range?: unknown): string;
    languageId?: string;
    uri?: unknown;
  };
  selection?: {
    isEmpty: boolean;
  };
}

export interface WindowLike {
  activeTextEditor?: TextEditorLike;
  showInformationMessage(message: string): unknown;
}

export type AnalysisHandler = (
  text: string,
  metadata?: { languageId?: string; uri?: unknown }
) => unknown;

/**
 * Registers manual code analysis commands for selection and entire files.
 * Pushes returned disposables into `context.subscriptions`.
 */
export function registerAnalysisCommands(
  commands: CommandRegistry,
  window: WindowLike,
  onAnalyze: AnalysisHandler
): vscode.Disposable[] {
  return [
    commands.registerCommand(ANALYZE_SELECTION_COMMAND, () => {
      const editor = window.activeTextEditor;
      if (!editor || !editor.selection || editor.selection.isEmpty) {
        window.showInformationMessage('SchemAI: Select a block of code to analyze.');
        return;
      }

      const text = editor.document.getText(editor.selection);
      if (!text || text.trim().length === 0) {
        window.showInformationMessage('SchemAI: Select a block of code to analyze.');
        return;
      }

      return onAnalyze(text, {
        languageId: editor.document.languageId,
        uri: editor.document.uri
      });
    }),

    commands.registerCommand(ANALYZE_FILE_COMMAND, () => {
      const editor = window.activeTextEditor;
      if (!editor) {
        window.showInformationMessage('SchemAI: Open a file to analyze.');
        return;
      }

      const text = editor.document.getText();
      if (!text || text.trim().length === 0) {
        window.showInformationMessage('SchemAI: File is empty.');
        return;
      }

      return onAnalyze(text, {
        languageId: editor.document.languageId,
        uri: editor.document.uri
      });
    })
  ];
}

