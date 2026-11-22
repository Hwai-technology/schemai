import * as vscode from 'vscode';
import type { HistoryManager } from '../history/historyManager';
import type { IAuditRecord } from '../history/historyStorage';
import type { ExplanationResult, LLMService } from '../llm/llmService';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class SchemAISidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'schemaAI.sidebarView';
  private _view?: vscode.WebviewView;
  private currentExplanation?: ExplanationResult;

  constructor(
    private readonly historyManager: HistoryManager,
    private readonly llmService?: LLMService,
    private readonly extensionUri?: vscode.Uri
  ) {
    this.historyManager.onHistoryChanged(() => {
      this.updateView();
    });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: this.extensionUri ? [this.extensionUri] : undefined
    };

    webviewView.webview.html = this.getHtmlContent();

    webviewView.webview.onDidReceiveMessage(
      async (data: { command?: string; id?: string; text?: string; license?: string }) => {
        if (data.command === 'openSettings') {
          void vscode.commands.executeCommand('workbench.action.openSettings', 'schemaAI');
        } else if (data.command === 'analyzeSelection') {
          void vscode.commands.executeCommand('schemaAI.analyzeSelection');
        } else if (data.command === 'checkLastPasted') {
          void vscode.commands.executeCommand('schemaAI.checkLastPasted');
        } else if (data.command === 'analyzeFile') {
          void vscode.commands.executeCommand('schemaAI.analyzeFile');
        } else if (data.command === 'switchLLM') {
          void vscode.commands.executeCommand('schemaAI.switchLLMProvider');
        } else if (data.command === 'clearHistory') {
          void vscode.commands.executeCommand('schemaAI.clearHistory');
        } else if (data.command === 'dismissExplanation') {
          this.currentExplanation = undefined;
          this.updateView();
        } else if (data.command === 'explainLastAudit') {
          await this.explainLatestAudit();
        } else if (data.command === 'explainEntry' && data.id) {
          await this.explainAuditEntry(data.id);
        } else if (data.command === 'markFalsePositive' && data.id) {
          await this.historyManager.markFalsePositive(data.id);
          void vscode.window.showInformationMessage('SchemAI: Alert marked as false positive.');
          this.updateView();
        } else if (data.command === 'openEntry' && data.id) {
          const history = this.historyManager.getRecords();
          const entry = history.find((e) => e.id === data.id);
          if (entry) {
            const detail = `License: ${entry.license || 'Unknown'} | Risk: ${entry.riskLevel}\nSource: ${entry.sourceUrl || 'N/A'}\nReason: ${entry.reason}`;
            void vscode.window.showInformationMessage(`SchemAI Audit [${entry.id}]: ${detail}`);
          }
        }
      }
    );
  }

  public async explainLatestAudit(): Promise<void> {
    const history = this.historyManager.getRecords();
    if (history.length === 0) {
      void vscode.window.showInformationMessage(
        'SchemAI: No audit detections recorded yet to explain.'
      );
      return;
    }
    const latest = history[history.length - 1];
    await this.explainAuditEntry(latest.id);
  }

  public async explainAuditEntry(id: string): Promise<void> {
    const history = this.historyManager.getRecords();
    const entry = history.find((e) => e.id === id);
    if (!entry) {
      return;
    }

    if (this.llmService) {
      void vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `SchemAI: Analyzing ${entry.license || 'License'} Risk with AI...`
        },
        async () => {
          if (!this.llmService) return;
          const snippetPreview = `// File: ${entry.filePath}\n// Detected: ${entry.license || 'Unknown'}\n// Reason: ${entry.reason}`;
          this.currentExplanation = await this.llmService.explainRisk(
            snippetPreview,
            entry.license || 'GPL-3.0'
          );
          this.updateView();
        }
      );
    }
  }

  public updateView(): void {
    if (this._view) {
      this._view.webview.html = this.getHtmlContent();
    }
  }

  private getHtmlContent(): string {
    const history = this.historyManager.getRecords();
    const lastEntry: IAuditRecord | undefined =
      history.length > 0 ? history[history.length - 1] : undefined;

    const highCount = history.filter(
      (e) =>
        e.riskLevel === 'critical' ||
        e.riskLevel === 'high' ||
        e.riskLevel === 'CRITICAL' ||
        e.riskLevel === 'HIGH' ||
        e.riskLevel === 'FORBIDDEN'
    ).length;
    const safeCount = history.filter(
      (e) => e.riskLevel === 'low' || e.riskLevel === 'LOW' || e.riskLevel === 'SAFE'
    ).length;
    const warningCount = history.filter(
      (e) =>
        e.riskLevel === 'medium' ||
        e.riskLevel === 'MEDIUM' ||
        e.riskLevel === 'warning' ||
        e.riskLevel === 'WARNING'
    ).length;

    const recentDetections = history.slice(-5).reverse();

    const logoUri =
      this._view && this.extensionUri
        ? this._view.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'schema_ai_team_logo.jpg')
          )
        : '';

    const llmConfig = this.llmService?.readConfig();
    const providerLabel =
      llmConfig?.provider === 'local'
        ? `Local LLM (${llmConfig.model || 'Ollama'})`
        : llmConfig?.provider === 'openai'
        ? `Cloud API (OpenAI ${llmConfig.model || 'gpt-4o'})`
        : 'Custom LLM API';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-bright: #ffffff;
      --cyan-neon: #00d2ff;
      --purple-neon: #9254de;
      --red-alert: #f85149;
      --green-safe: #3fb950;
      --amber-warn: #d29922;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 12px;
      font-size: 13px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo-img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(0, 210, 255, 0.4);
      object-fit: cover;
    }
    .brand-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-bright);
      letter-spacing: -0.3px;
    }
    .version-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 12px;
      background: rgba(0, 210, 255, 0.15);
      color: var(--cyan-neon);
      border: 1px solid rgba(0, 210, 255, 0.3);
    }
    .quick-toolbar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 12px;
    }
    button.tool-btn {
      background: #21262d;
      color: var(--text-bright);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      transition: all 0.15s ease;
    }
    button.tool-btn:hover {
      background: #30363d;
      border-color: var(--cyan-neon);
      color: var(--cyan-neon);
    }
    .section-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8b949e;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--text-bright);
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: var(--red-alert); box-shadow: 0 0 10px var(--red-alert); }
    .dot-green { background: var(--green-safe); box-shadow: 0 0 10px var(--green-safe); }
    .ai-box {
      border: 1px solid var(--purple-neon);
      background: rgba(146, 84, 222, 0.08);
      border-radius: 8px;
      padding: 10px;
      margin-top: 8px;
    }
    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .ai-title {
      font-size: 11px;
      font-weight: 700;
      color: #d2a8ff;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ai-text {
      font-size: 12px;
      line-height: 1.45;
      color: var(--text-bright);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .ai-controls {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .btn-ai-action {
      background: rgba(146, 84, 222, 0.2);
      border: 1px solid rgba(146, 84, 222, 0.4);
      color: #d2a8ff;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-ai-action:hover {
      background: rgba(146, 84, 222, 0.35);
    }
    .provider-pill {
      font-size: 10px;
      color: #8b949e;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 3px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.03);
    }
    .provider-pill:hover {
      color: var(--text-bright);
      background: rgba(255, 255, 255, 0.08);
    }
    .item-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.02);
      margin-top: 6px;
      border-left: 3px solid transparent;
    }
    .item-row.risk-high { border-left-color: var(--red-alert); }
    .item-row.risk-medium { border-left-color: var(--amber-warn); }
    .item-row.risk-safe { border-left-color: var(--green-safe); }
    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-info {
      font-weight: 600;
      font-size: 12px;
      color: var(--text-bright);
    }
    .item-actions {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }
    .btn-item {
      background: #21262d;
      border: 1px solid #30363d;
      color: #8b949e;
      border-radius: 4px;
      padding: 3px 6px;
      font-size: 10px;
      cursor: pointer;
    }
    .btn-item:hover {
      color: var(--text-bright);
      border-color: #58a6ff;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.03);
      padding: 8px;
      border-radius: 6px;
      text-align: center;
    }
    .stat-num {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-bright);
    }
    .stat-lbl {
      font-size: 10px;
      color: #8b949e;
      margin-top: 2px;
    }
    .btn-full {
      width: 100%;
      background: #21262d;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }
    .btn-full:hover {
      background: #30363d;
      color: var(--text-bright);
    }
  </style>
</head>
<body>
  <!-- Brand Header -->
  <div class="brand-header">
    <div class="brand-left">
      ${
        logoUri
          ? `<img src="${logoUri}" alt="SchemAI Logo" class="brand-logo-img" />`
          : '<div class="brand-logo-img" style="background:#00d2ff;"></div>'
      }
      <div class="brand-title">SchemAI</div>
    </div>
    <div class="version-pill">v3.0.1</div>
  </div>

  <!-- Quick Action Toolbar -->
  <div class="quick-toolbar">
    <button class="tool-btn" onclick="vscode.postMessage({ command: 'checkLastPasted' })">
      <span>📋 Check Paste</span>
    </button>
    <button class="tool-btn" onclick="vscode.postMessage({ command: 'analyzeSelection' })">
      <span>⚡ Selection</span>
    </button>
  </div>

  <!-- AI License Explainer (Local / Cloud API) -->
  <div class="section-card">
    <div class="section-title">
      <span>🤖 AI License Explainer</span>
      <span class="provider-pill" onclick="vscode.postMessage({ command: 'switchLLM' })" title="Click to switch Local/Cloud">
        ${escapeHtml(providerLabel)} ⚙️
      </span>
    </div>

    ${
      this.currentExplanation
        ? `
      <div class="ai-box">
        <div class="ai-header">
          <div class="ai-title">
            <span>✨</span> ${escapeHtml(this.currentExplanation.provider)}
          </div>
          <span style="font-size: 9px; color: #8b949e;">${new Date(
            this.currentExplanation.timestamp
          ).toLocaleTimeString()}</span>
        </div>
        <div class="ai-text">${escapeHtml(this.currentExplanation.text)}</div>
        <div class="ai-controls">
          <button class="btn-ai-action" onclick="vscode.postMessage({ command: 'dismissExplanation' })">Dismiss</button>
          <button class="btn-ai-action" onclick="vscode.postMessage({ command: 'switchLLM' })">Change Model</button>
        </div>
      </div>`
        : `
      <button class="btn-full" onclick="vscode.postMessage({ command: 'explainLastAudit' })">
        <span>✨ Generate AI Risk Explanation</span>
        <span>&gt;</span>
      </button>`
    }
  </div>

  <!-- Current Status -->
  <div class="section-card">
    <div class="section-title">
      <span>Current Analysis Status</span>
      <span>${lastEntry ? '🟢' : '⚪'}</span>
    </div>
    <div class="status-badge">
      <div class="status-dot ${highCount > 0 ? 'dot-red' : 'dot-green'}"></div>
      <span>Status: ${highCount > 0 ? `Critical Risk (${highCount})` : 'Protected & Safe'}</span>
    </div>
  </div>

  <!-- Recent Detections -->
  <div class="section-card">
    <div class="section-title">
      <span>Recent Detections</span>
      <span>🕒</span>
    </div>
    ${
      recentDetections.length > 0
        ? recentDetections
            .map((e) => {
              const isHigh =
                e.riskLevel === 'critical' ||
                e.riskLevel === 'high' ||
                e.riskLevel === 'CRITICAL' ||
                e.riskLevel === 'HIGH' ||
                e.riskLevel === 'FORBIDDEN';
              const isMed =
                e.riskLevel === 'medium' ||
                e.riskLevel === 'MEDIUM' ||
                e.riskLevel === 'warning';
              const riskClass = isHigh
                ? 'risk-high'
                : isMed
                ? 'risk-medium'
                : 'risk-safe';
              const fileName = e.filePath.split(/[/\\]/).pop() || 'File';

              return `
        <div class="item-row ${riskClass}">
          <div class="item-top">
            <span class="item-info">${isHigh ? '⚠️' : 'ℹ️'} [${escapeHtml(
                e.license || 'Unknown'
              )}] ${escapeHtml(fileName)}</span>
            <span style="font-size: 10px; color: #8b949e;">${escapeHtml(
              e.reviewStatus
            )}</span>
          </div>
          <div class="item-actions">
            <button class="btn-item" onclick="vscode.postMessage({ command: 'explainEntry', id: '${escapeHtml(
              e.id
            )}' })">🤖 AI Explain</button>
            <button class="btn-item" onclick="vscode.postMessage({ command: 'openEntry', id: '${escapeHtml(
              e.id
            )}' })">👁️ Details</button>
            <button class="btn-item" onclick="vscode.postMessage({ command: 'markFalsePositive', id: '${escapeHtml(
              e.id
            )}' })">🛡️ Ignore</button>
          </div>
        </div>`;
            })
            .join('')
        : '<p style="color: #8b949e; font-size: 11px; margin: 4px 0;">No suspicious code detected yet. Paste code to see real-time detection.</p>'
    }
  </div>

  <!-- Statistics -->
  <div class="section-card">
    <div class="section-title">
      <span>Statistics</span>
      <span>📊</span>
    </div>
    <div class="stats-grid">
      <div class="stat-pill">
        <div class="stat-num" style="color: var(--red-alert);">${highCount}</div>
        <div class="stat-lbl">High Risks</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num" style="color: var(--green-safe);">${safeCount}</div>
        <div class="stat-lbl">Safe Code</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num" style="color: var(--cyan-neon);">${history.length}</div>
        <div class="stat-lbl">Total Audits</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num" style="color: var(--amber-warn);">${warningCount}</div>
        <div class="stat-lbl">Warnings</div>
      </div>
    </div>
  </div>

  <!-- Settings & Controls -->
  <div class="section-card">
    <div class="section-title">
      <span>Settings & Management</span>
      <span>⚙️</span>
    </div>
    <button class="btn-full" onclick="vscode.postMessage({ command: 'openSettings' })">
      <span>Configuration & Project License</span>
      <span>&gt;</span>
    </button>
    <button class="btn-full" onclick="vscode.postMessage({ command: 'switchLLM' })">
      <span>Configure AI Model (Local / Cloud)</span>
      <span>&gt;</span>
    </button>
    <button class="btn-full" onclick="vscode.postMessage({ command: 'clearHistory' })">
      <span>Clear Audit History</span>
      <span>🗑️</span>
    </button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
  </script>
</body>
</html>`;
  }
}
