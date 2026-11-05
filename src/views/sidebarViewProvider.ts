import * as vscode from 'vscode';
import { HistoryManager } from '../history/historyManager';
import { PasteAuditEntry } from '../types';

export class SchemAISidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'schemaAI.sidebarView';
  private _view?: vscode.WebviewView;
  private historyManager: HistoryManager;

  constructor(historyManager: HistoryManager) {
    this.historyManager = historyManager;

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
      enableScripts: true
    };

    webviewView.webview.html = this.getHtmlContent();

    // Listen to messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.command === 'openSettings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'schemaAI');
      } else if (data.command === 'openEntry' && data.id) {
        const history = this.historyManager.getHistory();
        const entry = history.find(e => e.id === data.id);
        if (entry) {
          vscode.commands.executeCommand('schemaAI.showAuditDetail', entry);
        }
      } else if (data.command === 'analyzeSelection') {
        vscode.commands.executeCommand('schemaAI.analyzeSelection');
      }
    });
  }

  public updateView(): void {
    if (this._view) {
      this._view.webview.html = this.getHtmlContent();
    }
  }

  private getHtmlContent(): string {
    const history = this.historyManager.getHistory();
    const lastEntry = history.length > 0 ? history[0] : undefined;

    // Statistics
    const highCount = history.filter(
      e => e.riskLevel === 'FORBIDDEN' || e.riskLevel === 'HIGH'
    ).length;
    const safeCount = history.filter(
      e => e.riskLevel === 'SAFE' || e.riskLevel === 'LOW'
    ).length;
    const warningCount = history.filter(
      e => e.riskLevel === 'WARNING' || e.riskLevel === 'MEDIUM' || e.riskLevel === 'UNKNOWN'
    ).length;

    const recentDetections = history.slice(0, 4);

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
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 12px;
      font-size: 13px;
    }
    /* Brand Header */
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 14px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--cyan-neon), var(--purple-neon));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
      color: #000;
      box-shadow: 0 0 12px rgba(0, 210, 255, 0.4);
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-bright);
      letter-spacing: -0.5px;
    }
    /* Section Cards */
    .section-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
    }
    .section-card:hover {
      border-color: #58a6ff;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8b949e;
      font-weight: 700;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--text-bright);
      margin-top: 4px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-red { background: var(--red-alert); box-shadow: 0 0 8px var(--red-alert); }
    .dot-green { background: var(--green-safe); box-shadow: 0 0 8px var(--green-safe); }
    
    /* Detection Items */
    .item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 6px;
      border-radius: 6px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.02);
      margin-top: 6px;
    }
    .item-row:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .item-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 6px;
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
    button.btn-config {
      width: 100%;
      background: #21262d;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }
    button.btn-config:hover {
      background: #30363d;
      color: var(--text-bright);
    }
  </style>
</head>
<body>
  <!-- Brand Header -->
  <div class="brand-header">
    <div class="brand-logo">S</div>
    <div class="brand-title">SchemAI</div>
  </div>

  <!-- Current File Analysis -->
  <div class="section-card">
    <div class="section-title">
      <span>Current File Analysis</span>
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
            .map(
              e => `
        <div class="item-row" onclick="vscode.postMessage({ command: 'openEntry', id: '${e.id}' })">
          <div class="item-info">
            <span>${e.riskLevel === 'FORBIDDEN' || e.riskLevel === 'HIGH' ? '⚠️' : 'ℹ️'}</span>
            <span style="font-weight: 600;">${e.sourceMatch?.license || 'Unknown'} · ${e.fileName}</span>
          </div>
          <span style="color: #8b949e;">&gt;</span>
        </div>`
            )
            .join('')
        : '<p style="color: #8b949e; font-size: 11px; margin: 4px 0;">No suspicious code detected yet.</p>'
    }
  </div>

  <!-- Configuration -->
  <div class="section-card">
    <div class="section-title">
      <span>Configuration</span>
      <span>⚙️</span>
    </div>
    <button class="btn-config" onclick="vscode.postMessage({ command: 'openSettings' })">
      <span>Configuration Settings</span>
      <span>&gt;</span>
    </button>
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
        <div class="stat-num" style="color: #d29922;">${warningCount}</div>
        <div class="stat-lbl">Warnings</div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
  </script>
</body>
</html>`;
  }
}

