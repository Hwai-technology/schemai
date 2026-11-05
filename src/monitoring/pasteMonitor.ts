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
      // Ignore output panels, git diffs, settings, or internal schemes
      if (
        event.document.uri.scheme !== 'file' &&
        event.document.uri.scheme !== 'untitled'
      ) {
        return;
      }

      // Ignore multi-change events (like Prettier formatting on save, refactor, replace-all)
      if (event.contentChanges.length === 0 || event.contentChanges.length > 2) {
        return;
      }

      // Exclude SchemAI's internal source files during extension self-development
      const fsPath = event.document.uri.fsPath.replace(/\\/g, '/');
      if (
        fsPath.includes('/schemai/src/') ||
        fsPath.endsWith('/sourceSearch.ts') ||
        fsPath.endsWith('/riskEngine.ts')
      ) {
        return;
      }

      for (const change of event.contentChanges) {
        const insertedText = change.text;

        // Skip small edits or single-line character typing
        if (
          insertedText.length < 30 ||
          (!insertedText.includes('\n') && !insertedText.includes(';') && !insertedText.includes('{'))
        ) {
          continue;
        }

        // Quick heuristic check: must look like actual source code
        if (!CodeAnalyzer.isLikelyCode(insertedText)) {
          continue;
        }

        // Strict non-blocking clipboard and workspace verification check
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
      // 1. Strict Clipboard Verification (Zero Guessing)
      let clipboardText = '';
      try {
        clipboardText = await vscode.env.clipboard.readText();
      } catch {
        // If clipboard cannot be read, NEVER guess it is a paste (strict verification)
        return;
      }

      if (!clipboardText || clipboardText.trim().length < 25) {
        // Clipboard is empty or too short; this is manual typing, formatting, or snippet expansion
        return;
      }

      // Normalize whitespace and indentation to compare
      const normClipboard = clipboardText.replace(/\r?\n\s*/g, '\n').trim();
      const normInserted = insertedText.replace(/\r?\n\s*/g, '\n').trim();

      // Must be an authentic clipboard paste
      if (normClipboard !== normInserted && !normInserted.includes(normClipboard)) {
        return;
      }

      // 2. Project Workspace Exclusion:
      // Check if this snippet already exists in the user's workspace documents (copying own project code)
      const trimmedSnippet = insertedText.trim();
      for (const openDoc of vscode.workspace.textDocuments) {
        if (openDoc.uri.scheme === 'file') {
          const docText = openDoc.getText();
          const occurrences = docText.split(trimmedSnippet).length - 1;

          // Copied from another open file in the workspace
          if (openDoc.uri.toString() !== document.uri.toString() && occurrences >= 1) {
            return;
          }
          // Internal code duplicate within the exact same file
          if (openDoc.uri.toString() === document.uri.toString() && occurrences > 1) {
            return;
          }
        }
      }

      const fingerprint = CodeAnalyzer.generateFingerprint(insertedText);
      const hash = CodeAnalyzer.generateHash(fingerprint);

      // Prevent immediate duplicate firing from multi-cursor or rapid re-paste
      if (this.lastCapturedHash === hash) {
        return;
      }
      this.lastCapturedHash = hash;
      setTimeout(() => {
        if (this.lastCapturedHash === hash) {
          this.lastCapturedHash = undefined;
        }
      }, 3000);

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
