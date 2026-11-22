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

/**
 * Decides whether automatic analysis is enabled for the current workspace.
 * Re-evaluated on every change so configuration updates apply without reload.
 */
export type AutoAnalyzeGate = () => boolean;

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
  private readonly isAutoAnalyzeEnabled?: AutoAnalyzeGate;

  constructor(
    clipboard: ClipboardReader,
    onPaste: PasteHandler,
    isAutoAnalyzeEnabled?: AutoAnalyzeGate
  ) {
    this.clipboard = clipboard;
    this.onPaste = onPaste;
    this.isAutoAnalyzeEnabled = isAutoAnalyzeEnabled;
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
    if (this.isAutoAnalyzeEnabled && !this.isAutoAnalyzeEnabled()) {
      return;
    }

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

      // Ignore single-character typing
      if (insertedText.length <= 1) {
        continue;
      }

      const normalizedInserted = PasteMonitor.normalizeLineEndings(insertedText);
      const isExactMatch = normalizedInserted === normalizedClipboard;
      const isTrimmedMatch = normalizedInserted.trim() === normalizedClipboard.trim();
      const isStrippedMatch =
        PasteMonitor.stripIndentation(normalizedInserted) ===
        PasteMonitor.stripIndentation(normalizedClipboard);

      if (!isExactMatch && !isTrimmedMatch && !isStrippedMatch) {
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

  private static stripIndentation(text: string): string {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }
}

