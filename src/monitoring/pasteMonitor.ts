import * as vscode from 'vscode';
import { CodeAnalyzer } from '../codeAnalyzer';
import { AnalysisQueue, QueuedAnalysisItem } from './analysisQueue';

export class PasteMonitor {
  private queue: AnalysisQueue;
  private lastCapturedHash: string | undefined;

  constructor(queue: AnalysisQueue) {
    this.queue = queue;
  }

  public register(context: vscode.ExtensionContext): void {
    const disposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
      // Ignore output panels or git diffs/internal schemes
      if (
        event.document.uri.scheme !== 'file' &&
        event.document.uri.scheme !== 'untitled'
      ) {
        return;
      }

      if (event.contentChanges.length === 0) return;

      for (const change of event.contentChanges) {
        const insertedText = change.text;

        // Skip small edits or single-line character typing
        if (
          insertedText.length < 20 ||
          (!insertedText.includes('\n') && !insertedText.includes(';') && !insertedText.includes('{'))
        ) {
          continue;
        }

        // Quick heuristic check
        if (!CodeAnalyzer.isLikelyCode(insertedText)) {
          continue;
        }

        // Non-blocking clipboard comparison check
        this.verifyAndEnqueue(event.document, change, insertedText);
      }
    });

    context.subscriptions.push(disposable);
  }

  private async verifyAndEnqueue(
    document: vscode.TextDocument,
    change: vscode.TextDocumentContentChangeEvent,
    insertedText: string
  ): Promise<void> {
    try {
      // Quick async clipboard peek with fallback
      let isClipboardMatch = true;
      try {
        const clipboardText = await vscode.env.clipboard.readText();
        if (clipboardText && clipboardText.trim() !== insertedText.trim()) {
          // If clipboard exists and clearly differs, it could be a code formatting or multi-cursor duplicate
          isClipboardMatch = false;
        }
      } catch {
        // In environments where clipboard permission is restricted, proceed based on heuristics
        isClipboardMatch = true;
      }

      if (!isClipboardMatch) return;

      const fingerprint = CodeAnalyzer.generateFingerprint(insertedText);
      const hash = CodeAnalyzer.generateHash(fingerprint);

      // Prevent immediate duplicate firing from multiple cursor paste
      if (this.lastCapturedHash === hash) {
        return;
      }
      this.lastCapturedHash = hash;
      setTimeout(() => {
        if (this.lastCapturedHash === hash) {
          this.lastCapturedHash = undefined;
        }
      }, 2000);

      const item: QueuedAnalysisItem = {
        id: `paste_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: insertedText,
        fingerprint,
        fingerprintHash: hash,
        languageId: document.languageId,
        documentUri: document.uri,
        range: change.range,
        isManual: false
      };

      this.queue.enqueue(item);
    } catch (err) {
      console.warn('SchemAI: Error during paste event processing', err);
    }
  }
}

