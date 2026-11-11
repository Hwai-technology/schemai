import type * as vscode from 'vscode';

export interface ClipboardReader {
  readText(): Thenable<string> | Promise<string>;
}

export interface DetectedPasteEvent {
  text: string;
  languageId: string;
  documentUri: vscode.Uri;
  range: vscode.Range;
}

export type PasteHandler = (paste: DetectedPasteEvent) => void;

export interface WorkspaceEventSource {
  onDidChangeTextDocument: (
    listener: (e: vscode.TextDocumentChangeEvent) => any
  ) => vscode.Disposable;
}

/**
 * Monitors editor document changes to detect multi-line clipboard paste events.
 */
export class PasteMonitor {
  private readonly clipboard: ClipboardReader;
  private readonly onPaste: PasteHandler;

  constructor(clipboard: ClipboardReader, onPaste: PasteHandler) {
    this.clipboard = clipboard;
    this.onPaste = onPaste;
  }

  public register(
    context: vscode.ExtensionContext,
    workspace?: WorkspaceEventSource
  ): void {
    const ws: WorkspaceEventSource =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      workspace ?? (require('vscode') as typeof vscode).workspace;
    const disposable = ws.onDidChangeTextDocument((event) => {
      void this.handleTextDocumentChange(event);
    });
    context.subscriptions.push(disposable);
  }

  public async handleTextDocumentChange(
    event: vscode.TextDocumentChangeEvent
  ): Promise<void> {
    if (event.contentChanges.length === 0) {
      return;
    }

    const clipboardText = await this.clipboard.readText();
    if (!clipboardText || clipboardText.trim().length === 0) {
      return;
    }

    const normalizedClipboard = PasteMonitor.normalizeLineEndings(clipboardText);

    for (const change of event.contentChanges) {
      const insertedText = change.text;

      // Ignore single-character typing or single-line insertions
      if (insertedText.length <= 1 || !insertedText.includes('\n')) {
        continue;
      }

      const normalizedInserted = PasteMonitor.normalizeLineEndings(insertedText);
      if (normalizedInserted !== normalizedClipboard) {
        continue;
      }

      this.onPaste({
        text: insertedText,
        languageId: event.document.languageId,
        documentUri: event.document.uri,
        range: change.range
      });
    }
  }

  private static normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, '\n');
  }
}

