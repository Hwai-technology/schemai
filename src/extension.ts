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
import { HistoryStorage, HISTORY_STORAGE_KEY } from './history/historyStorage';
import { LLMService } from './llm/llmService';
import { SchemAIQuickFixProvider, IGNORE_ALERT_COMMAND } from './quickfix/codeActionProvider';
import { SecretStorageService } from './security/secretStorage';
import { TokenStore } from './security/tokens';
import { HistoryTreeProvider } from './views/historyTreeProvider';
import { SchemAISidebarViewProvider } from './views/sidebarViewProvider';

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

  if (vs.commands?.registerCommand) {
    context.subscriptions.push(
      vs.commands.registerCommand('schemaAI.manageAccount', async () => {
        const session = await authManager.getCurrentSession();
        if (session) {
          const userLabel = session.account?.label || 'GitHub User';
          const action = await vs.window.showInformationMessage(
            `Signed in as GitHub user: ${userLabel}`,
            'Sign Out'
          );
          if (action === 'Sign Out') {
            authManager.signOut();
          }
        } else {
          await authManager.signIn();
        }
      })
    );
  }

  // 3. History Management, LLM Service & Sidebar Views
  const historyStorage = new HistoryStorage(context.workspaceState);
  const historyManager = new HistoryManager(historyStorage, diagnosticsManager);
  const llmService = new LLMService(secretStorage);

  if (vs.window?.registerWebviewViewProvider) {
    const sidebarProvider = new SchemAISidebarViewProvider(
      historyManager,
      llmService,
      context.extensionUri
    );
    context.subscriptions.push(
      vs.window.registerWebviewViewProvider(SchemAISidebarViewProvider.viewType, sidebarProvider)
    );
  }

  if (vs.window?.registerTreeDataProvider) {
    const historyTreeProvider = new HistoryTreeProvider(historyManager);
    context.subscriptions.push(
      vs.window.registerTreeDataProvider('schemaAI.auditHistoryView', historyTreeProvider)
    );
  }

  if (vs.commands?.registerCommand) {
    context.subscriptions.push(
      vs.commands.registerCommand('schemaAI.showAuditLog', async () => {
        const records = historyManager.getRecords();
        if (records.length === 0) {
          void vs.window.showInformationMessage('SchemAI: No paste or license history recorded yet.');
        } else {
          void vs.window.showInformationMessage(`SchemAI: ${records.length} audit records in history.`);
        }
      }),
      vs.commands.registerCommand('schemaAI.clearHistory', async () => {
        await context.workspaceState.update(HISTORY_STORAGE_KEY, []);
        void vs.window.showInformationMessage('SchemAI: Audit history cleared.');
      }),
      vs.commands.registerCommand('schemaAI.markFalsePositive', async (item?: { entry?: { id: string } }) => {
        if (item?.entry?.id) {
          await historyManager.markFalsePositive(item.entry.id);
          void vs.window.showInformationMessage('SchemAI: Alert marked as false positive.');
        }
      }),
      vs.commands.registerCommand('schemaAI.explainRiskWithAI', async () => {
        const records = historyManager.getRecords();
        if (records.length === 0) {
          void vs.window.showInformationMessage('SchemAI: No audit detections recorded yet to explain.');
          return;
        }
        const latest = records[records.length - 1];
        const snippetPreview = `// File: ${latest.filePath}\n// Reason: ${latest.reason}`;
        void vs.window.withProgress(
          {
            location: vs.ProgressLocation?.Notification ?? 15,
            title: `SchemAI: Analyzing ${latest.license || 'License'} Risk with AI...`
          },
          async () => {
            const explanation = await llmService.explainRisk(
              snippetPreview,
              latest.license || 'GPL-3.0'
            );
            void vs.window.showInformationMessage(
              `SchemAI AI Explanation [${explanation.provider}]:\n\n${explanation.text}`
            );
          }
        );
      }),
      vs.commands.registerCommand('schemaAI.switchLLMProvider', async () => {
        if (!vs.window?.showQuickPick) {
          return;
        }
        const choice = await vs.window.showQuickPick(
          [
            {
              label: '$(server) Local LLM (Ollama)',
              description: 'http://localhost:11434 - No API key needed, offline friendly',
              provider: 'local',
              endpoint: 'http://localhost:11434/v1/chat/completions',
              model: 'llama3'
            },
            {
              label: '$(server-process) Local LLM (LM Studio)',
              description: 'http://localhost:1234 - Local desktop model',
              provider: 'local',
              endpoint: 'http://localhost:1234/v1/chat/completions',
              model: 'local-model'
            },
            {
              label: '$(cloud) OpenAI Cloud API',
              description: 'api.openai.com - Cloud model (requires API key in SecretStorage)',
              provider: 'openai',
              endpoint: 'https://api.openai.com/v1/chat/completions',
              model: 'gpt-4o-mini'
            },
            {
              label: '$(gear) Custom Endpoint',
              description: 'Specify your own custom LLM server URL',
              provider: 'custom',
              endpoint: 'http://localhost:8000/v1/chat/completions',
              model: 'custom'
            }
          ],
          { placeHolder: 'Select AI / LLM Provider for License Explanations' }
        );

        if (choice && vs.workspace?.getConfiguration) {
          const cfg = vs.workspace.getConfiguration('schemaAI');
          await cfg.update('llmProvider', choice.provider, true);
          await cfg.update('llmEndpoint', choice.endpoint, true);
          await cfg.update('llmModel', choice.model, true);
          void vs.window.showInformationMessage(
            `SchemAI: AI provider updated to ${choice.label} (${choice.model}).`
          );
        }
      })
    );
  }

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

  if (vs.commands?.registerCommand) {
    context.subscriptions.push(
      vs.commands.registerCommand('schemaAI.checkLastPasted', async () => {
        const text = await vs.env.clipboard.readText();
        if (!text || text.trim().length === 0) {
          void vs.window.showInformationMessage('SchemAI: Clipboard is empty.');
          return;
        }
        const fingerprint = CodeAnalyzer.generateFingerprint(text);
        queue.enqueue({
          id: `clipboard-${Date.now()}`,
          text,
          fingerprint,
          fingerprintHash: fingerprint,
          isManual: true
        });
        void vs.window.showInformationMessage('SchemAI: Clipboard content submitted for risk analysis.');
      })
    );
  }

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
