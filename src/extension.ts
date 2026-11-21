import type * as vscode from 'vscode';
import { register as registerDiagnosticsManager } from './alerts/diagnosticsManager';
import { register as registerEditorDecorator } from './alerts/editorDecorator';
import { register as registerHoverProvider } from './alerts/hoverProvider';
import { register as registerRiskCardPanel } from './alerts/riskCardPanel';
import { registerAnalysisCommands } from './analysis/commands';
import { AnalysisQueue, createPasteAnalysisHandler } from './analysis/analysisQueue';
import { CodeAnalyzer } from './analysis/codeAnalyzer';
import { PasteMonitor } from './analysis/pasteMonitor';
import { AuthManager } from './auth/authManager';
import { AuthStatusBar } from './auth/authStatusBar';
import { registerAuthCommands } from './auth/commands';
import { SettingsManager } from './config/settings';
import { detectWorkspaceLicense } from './config/workspaceLicense';
import { HistoryManager } from './history/historyManager';
import { HistoryStorage } from './history/historyStorage';
import { SchemAIQuickFixProvider, IGNORE_ALERT_COMMAND } from './quickfix/codeActionProvider';
import { SecretStorageService } from './security/secretStorage';
import { TokenStore } from './security/tokens';

/**
 * Extension entry point activated when VS Code starts up.
 * Coordinates feature registration and module lifecycle wiring.
 */
export function activate(context: vscode.ExtensionContext, customVscode?: typeof vscode): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vs = customVscode ?? (require('vscode') as typeof vscode);

  // 1. Alerts & Diagnostics UI
  const diagnosticsManager = registerDiagnosticsManager(context);
  registerEditorDecorator(context);
  registerHoverProvider(context);
  registerRiskCardPanel(context);

  // 2. Authentication & Credential Security
  const secretStorage = new SecretStorageService(context.secrets);
  const settingsSection = vs.workspace?.getConfiguration
    ? vs.workspace.getConfiguration('schemaAI')
    : { get: () => undefined, update: async () => {} };
  const tokenStore = new TokenStore(secretStorage, settingsSection);
  tokenStore.migrateLegacyGitHubToken().catch(() => {
    // Safe fallback if configuration migration fails
  });

  const authManager = new AuthManager({
    authentication: vs.authentication,
    window: vs.window
  });
  const statusBarAlignment = vs.StatusBarAlignment?.Right ?? 2;
  const statusItem = vs.window.createStatusBarItem(statusBarAlignment, 100);
  const authStatusBar = new AuthStatusBar(statusItem, authManager, vs.authentication);
  context.subscriptions.push(authStatusBar);

  const authDisposables = registerAuthCommands(vs.commands, authManager);
  context.subscriptions.push(...authDisposables);

  // 3. History Management
  const historyStorage = new HistoryStorage(context.workspaceState);
  const historyManager = new HistoryManager(historyStorage, diagnosticsManager);

  // 4. QuickFix Provider and Ignore Command
  const quickFixProvider = new SchemAIQuickFixProvider(vs as any, diagnosticsManager);
  quickFixProvider.register(context);

  const ignoreAlertDisposable = vs.commands.registerCommand(
    IGNORE_ALERT_COMMAND,
    async (uri: vscode.Uri, range: vscode.Range) => {
      const alert = diagnosticsManager.findAlert(uri, range);
      if (alert) {
        const record = await historyManager.record(alert);
        await historyManager.markFalsePositive(record.id);
      } else {
        diagnosticsManager.clear(uri);
      }
    }
  );
  context.subscriptions.push(ignoreAlertDisposable);

  // 5. Code Analysis & Paste Monitoring
  const queue = AnalysisQueue.getInstance();
  const pasteHandler = createPasteAnalysisHandler(queue, (text) => CodeAnalyzer.generateFingerprint(text));

  const isAutoAnalyze = () => {
    if (!vs.workspace?.getConfiguration) {
      return true;
    }
    const cfg = vs.workspace.getConfiguration('schemaAI');
    return SettingsManager.isAutoAnalyzeEnabled(cfg);
  };

  const pasteMonitor = new PasteMonitor(
    vs.env.clipboard,
    pasteHandler,
    isAutoAnalyze
  );
  pasteMonitor.register(context, vs.workspace);

  const analysisDisposables = registerAnalysisCommands(
    vs.commands,
    vs.window,
    (text, metadata) => {
      const fingerprint = CodeAnalyzer.generateFingerprint(text);
      queue.enqueue({
        id: `manual-${Date.now()}`,
        text,
        fingerprint,
        fingerprintHash: fingerprint,
        languageId: metadata?.languageId,
        documentUri: metadata?.uri,
        isManual: true
      });
    },
    vs.workspace
  );
  context.subscriptions.push(...analysisDisposables);

  // 6. Workspace License Detection
  if (vs.workspace?.workspaceFolders && vs.workspace.workspaceFolders.length > 0) {
    detectWorkspaceLicense().catch(() => {
      // Non-blocking background detection
    });
  }
}

/**
 * Extension deactivation lifecycle hook.
 * Handles cleanup of resources when the extension is deactivated.
 */
export function deactivate(): void {
  AnalysisQueue.getInstance().dispose();
}
