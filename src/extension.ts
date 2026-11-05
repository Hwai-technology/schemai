import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';
import { SourceSearchEngine } from './sourceSearch';
import { RiskEngine } from './riskEngine';
import { AnalysisResult, ProjectPolicy, PasteAuditEntry } from './types';
import { SecretStorageManager } from './security/secretStorage';
import { AuthManager } from './auth/authManager';
import { AuthStatusBarItem } from './auth/authStatusBar';
import { AnalysisQueue, QueuedAnalysisItem } from './monitoring/analysisQueue';
import { PasteMonitor } from './monitoring/pasteMonitor';
import { HistoryManager } from './history/historyManager';
import { HistoryTreeProvider } from './history/historyTreeProvider';
import { DiagnosticsManager } from './diagnostics/diagnosticsManager';
import { EditorDecorator } from './diagnostics/editorDecorator';
import { SchemAIHoverProvider } from './diagnostics/hoverProvider';

export async function activate(context: vscode.ExtensionContext) {
  console.log('SchemAI extension activating...');

  // 1. Initialize Security & Credentials (HU-03)
  const secretStorageManager = SecretStorageManager.initialize(context.secrets);
  await secretStorageManager.migrateLegacySettingsToken();

  // 2. Initialize Authentication & Status Bar (HU-02)
  const authManager = AuthManager.getInstance();
  await authManager.initialize(context);
  const authStatusBar = new AuthStatusBarItem(authManager);
  context.subscriptions.push(authStatusBar);

  // 3. Initialize History & Persistent Audit Storage (HU-16 GAP)
  const historyManager = HistoryManager.initialize(context.workspaceState);
  const historyTreeProvider = new HistoryTreeProvider(historyManager);
  vscode.window.registerTreeDataProvider('schemaAI.auditHistoryView', historyTreeProvider);

  // 4. Initialize Diagnostics, Decorations & Hover (HU-11 & HU-12)
  const diagnosticsManager = new DiagnosticsManager();
  diagnosticsManager.register(context);

  const editorDecorator = new EditorDecorator();
  editorDecorator.register(context);

  const hoverProvider = new SchemAIHoverProvider(historyManager);
  hoverProvider.register(context);

  // 5. Initialize Async Non-Blocking Analysis Queue (HU-05)
  const analysisQueue = AnalysisQueue.getInstance();
  context.subscriptions.push(analysisQueue);

  // Listen for completed analyses from the queue
  analysisQueue.onAnalysisComplete(async ({ item, result }) => {
    // Record into persistent history
    const fileName = item.documentUri.path.split('/').pop() || 'Untitled';
    const entry = await historyManager.recordAnalysis(
      result,
      fileName,
      item.documentUri.fsPath,
      item.text,
      item.range
        ? {
            startLine: item.range.start.line,
            endLine: item.range.end.line
          }
        : undefined
    );

    // Update Diagnostics
    diagnosticsManager.updateDiagnostic(item.documentUri, item.range, result);

    // Apply editor decorations if editor is active
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.toString() === item.documentUri.toString() && item.range) {
      editorDecorator.applyDecoration(activeEditor, item.range, result);
    }

    // Show Notification Alert for High / Medium risks or manual runs
    if (
      result.riskLevel === 'FORBIDDEN' ||
      result.riskLevel === 'HIGH' ||
      result.riskLevel === 'WARNING' ||
      result.riskLevel === 'MEDIUM' ||
      item.isManual
    ) {
      displayResultNotification(entry, result);
    }
  });

  // 6. Register Paste Event Monitor (HU-05)
  const pasteMonitor = new PasteMonitor(analysisQueue);
  pasteMonitor.register(context);

  // 7. Register Commands (HU-02, HU-06, HU-12, HU-13)
  registerCommands(context, authManager, authStatusBar, historyManager, analysisQueue);

  // If user is not authenticated on startup, suggest connection gently
  if (!authManager.isAuthenticated()) {
    setTimeout(async () => {
      if (!authManager.isAuthenticated()) {
        const choice = await vscode.window.showInformationMessage(
          'SchemAI: Connect your personal GitHub account to enable real-time license tracking without rate limits.',
          'Connect GitHub',
          'Later'
        );
        if (choice === 'Connect GitHub') {
          await authManager.login();
        }
      }
    }, 4000);
  }

  console.log('SchemAI extension activated successfully.');
}

function registerCommands(
  context: vscode.ExtensionContext,
  authManager: AuthManager,
  authStatusBar: AuthStatusBarItem,
  historyManager: HistoryManager,
  analysisQueue: AnalysisQueue
) {
  // Command: Manual Analysis of Selected Code (HU-06)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.analyzeSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('SchemAI: No active editor found.');
        return;
      }

      const selectionText = editor.document.getText(editor.selection);
      if (!selectionText || selectionText.trim().length === 0) {
        vscode.window.showInformationMessage('SchemAI: Please select some code to analyze.');
        return;
      }

      // Check session warning
      await authManager.warnIfNoSessionBeforeAnalysis();

      const fingerprint = CodeAnalyzer.generateFingerprint(selectionText);
      const hash = CodeAnalyzer.generateHash(fingerprint);

      const item: QueuedAnalysisItem = {
        id: `manual_${Date.now()}`,
        text: selectionText,
        fingerprint,
        fingerprintHash: hash,
        languageId: editor.document.languageId,
        documentUri: editor.document.uri,
        range: editor.selection,
        isManual: true
      };

      analysisQueue.enqueue(item, true);
    })
  );

  // Command: Check Last Pasted Code Risk (User Request / Context Menu)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.checkLastPasted', async () => {
      const lastEntry = historyManager.getLastEntry();
      if (!lastEntry) {
        vscode.window.showInformationMessage('SchemAI: No previous pasted code analyses recorded yet.');
        return;
      }

      showEntryQuickDetail(lastEntry, historyManager);
    })
  );

  // Command: Show Paste Audit Log / History (User Request / Context Menu)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.showAuditLog', async () => {
      const history = historyManager.getHistory();
      if (history.length === 0) {
        vscode.window.showInformationMessage('SchemAI: Audit log is empty. No code snippets analyzed yet.');
        return;
      }

      const quickPickItems = history.map(entry => {
        let icon = '$(check)';
        if (entry.riskLevel === 'FORBIDDEN' || entry.riskLevel === 'HIGH') icon = '$(error)';
        else if (entry.riskLevel === 'WARNING' || entry.riskLevel === 'MEDIUM') icon = '$(warning)';
        else if (entry.riskLevel === 'UNKNOWN') icon = '$(question)';

        return {
          label: `${icon} [${entry.sourceMatch?.license || 'UNKNOWN'}] ${entry.fileName}`,
          description: `${new Date(entry.timestamp).toLocaleTimeString()} · ${entry.riskLevel}`,
          detail: `Repo: ${entry.sourceMatch?.repository || 'External'} | ${entry.reason}`,
          entry
        };
      });

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'SchemAI Audit Log: Select an entry to view full license details'
      });

      if (selected) {
        showEntryQuickDetail(selected.entry, historyManager);
      }
    })
  );

  // Command: Show Single Audit Detail (HU-12)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.showAuditDetail', (entry: PasteAuditEntry) => {
      showEntryQuickDetail(entry, historyManager);
    })
  );

  // Command: Authentication Management (HU-02)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.login', async () => {
      await authManager.login();
    }),
    vscode.commands.registerCommand('schemaAI.manageAccount', async () => {
      await authStatusBar.showAccountMenu();
    }),
    vscode.commands.registerCommand('schemaAI.disconnect', async () => {
      await authManager.disconnect();
    })
  );

  // Command: Clear Audit History
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.clearHistory', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear the SchemAI audit history for this workspace?',
        'Clear History',
        'Cancel'
      );
      if (confirm === 'Clear History') {
        await historyManager.clearHistory();
        vscode.window.showInformationMessage('SchemAI: Workspace audit history cleared.');
      }
    })
  );

  // Command: Mark False Positive (HU-13)
  context.subscriptions.push(
    vscode.commands.registerCommand('schemaAI.markFalsePositive', async (item?: any) => {
      const entryId = item?.entry?.id || historyManager.getLastEntry()?.id;
      if (!entryId) return;

      const notes = await vscode.window.showInputBox({
        prompt: 'Optional: Enter notes for marking as false positive',
        placeHolder: 'e.g., Code was written in-house / authorized exception'
      });

      await historyManager.markFalsePositive(entryId, notes);
      vscode.window.showInformationMessage('SchemAI: Marked alert as False Positive.');
    })
  );
}

function showEntryQuickDetail(entry: PasteAuditEntry, historyManager: HistoryManager) {
  const panel = vscode.window.createWebviewPanel(
    'schemaAIDetail',
    `SchemAI: ${entry.fileName} (${entry.riskLevel})`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const statusColor =
    entry.riskLevel === 'FORBIDDEN' || entry.riskLevel === 'HIGH'
      ? '#f85149'
      : entry.riskLevel === 'WARNING' || entry.riskLevel === 'MEDIUM'
      ? '#d29922'
      : entry.riskLevel === 'UNKNOWN'
      ? '#8b949e'
      : '#2ea043';

  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; color: white; background: ${statusColor}; }
    .card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px; margin: 16px 0; }
    pre { background: var(--vscode-textBlockCode-background); padding: 12px; border-radius: 4px; overflow-x: auto; }
    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    a { color: var(--vscode-textLink-foreground); }
  </style>
</head>
<body>
  <h2>🛡️ SchemAI Analysis Audit Details</h2>
  <p><span class="badge">${entry.riskLevel}</span> <strong>Status:</strong> ${entry.reviewStatus} · <strong>Time:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
  
  <div class="card">
    <h3>📋 Summary</h3>
    <p><strong>Target File:</strong> <code>${entry.filePath}</code></p>
    <p><strong>Detected License:</strong> <code>${entry.sourceMatch?.license || 'UNKNOWN'}</code></p>
    <p><strong>External Source:</strong> <a href="${entry.sourceMatch?.url || '#'}">${entry.sourceMatch?.repository || 'External match'}</a></p>
    <p><strong>Reason:</strong> ${entry.reason}</p>
    ${entry.reviewNotes ? `<p><strong>Review Notes:</strong> <em>${entry.reviewNotes}</em></p>` : ''}
  </div>

  <div class="card">
    <h3>🔍 Snippet Preview</h3>
    <pre><code>${escapeHtml(entry.snippetPreview)}</code></pre>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function displayResultNotification(
  entry: PasteAuditEntry,
  result: AnalysisResult
) {
  const message = `[SchemAI] ${result.riskLevel}: ${result.reason}`;

  if (result.riskLevel === 'FORBIDDEN' || result.riskLevel === 'HIGH') {
    vscode.window
      .showErrorMessage(message, 'View Details', 'Open Source', 'Mark Reviewed')
      .then(selection => {
        handleNotificationAction(selection, entry);
      });
  } else if (result.riskLevel === 'WARNING' || result.riskLevel === 'MEDIUM' || result.riskLevel === 'UNKNOWN') {
    vscode.window
      .showWarningMessage(message, 'View Details', 'Open Source', 'Mark Reviewed')
      .then(selection => {
        handleNotificationAction(selection, entry);
      });
  } else {
    vscode.window.showInformationMessage(
      `[SchemAI] SAFE: Code appears compatible with project policy (${result.projectPolicy}).`
    );
  }
}

function handleNotificationAction(selection: string | undefined, entry: PasteAuditEntry) {
  if (selection === 'View Details') {
    vscode.commands.executeCommand('schemaAI.showAuditDetail', entry);
  } else if (selection === 'Open Source' && entry.sourceMatch?.url) {
    vscode.env.openExternal(vscode.Uri.parse(entry.sourceMatch.url));
  } else if (selection === 'Mark Reviewed') {
    HistoryManager.getInstance().markReviewed(entry.id);
    vscode.window.showInformationMessage('SchemAI: Alert marked as Reviewed.');
  }
}

export function deactivate() {}
