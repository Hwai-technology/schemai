import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';

/**
 * Reference Code for Ahmet (HU-05)
 * Monitors paste events across active text documents non-blockingly.
 */
export class PasteMonitor {
  private queue: any;

  constructor(analysisQueue: any) {
    this.queue = analysisQueue;
  }

  public register(context: vscode.ExtensionContext): void {
    const disposable = vscode.workspace.onDidChangeTextDocument(event => {
      this.handleTextDocumentChange(event);
    });

    context.subscriptions.push(disposable);
  }

  private handleTextDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    if (event.contentChanges.length === 0) return;

    for (const change of event.contentChanges) {
      const text = change.text;

      // Filter trivial typing or single characters (paste heuristic)
      if (text.length < 30 || !text.includes('\n')) {
        continue;
      }

      if (!CodeAnalyzer.isLikelyCode(text)) {
        continue;
      }

      const fingerprint = CodeAnalyzer.generateFingerprint(text);
      const hash = CodeAnalyzer.generateHash(fingerprint);

      this.queue.enqueue({
        id: `paste_${Date.now()}`,
        text,
        fingerprint,
        fingerprintHash: hash,
        languageId: event.document.languageId,
        documentUri: event.document.uri,
        range: change.range,
        isManual: false
      });
    }
  }
}

