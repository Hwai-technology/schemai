import * as vscode from 'vscode';
import { PasteAuditEntry } from '../types';

export class RiskCardPanel {
  public static currentPanel: RiskCardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, entry: PasteAuditEntry) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this.update(entry);
  }

  public static show(entry: PasteAuditEntry): RiskCardPanel {
    const column = vscode.ViewColumn.Beside;

    if (RiskCardPanel.currentPanel) {
      RiskCardPanel.currentPanel._panel.reveal(column);
      RiskCardPanel.currentPanel.update(entry);
      return RiskCardPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'schemaILiveRiskCard',
      `SchemAI: ${entry.sourceMatch?.license || 'Risk'} Analysis`,
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    RiskCardPanel.currentPanel = new RiskCardPanel(panel, entry);
    return RiskCardPanel.currentPanel;
  }

  public update(entry: PasteAuditEntry): void {
    this._panel.title = `SchemAI: ${entry.sourceMatch?.license || 'License'} Risk`;
    this._panel.webview.html = this.getHtmlForWebview(entry);
  }

  private getHtmlForWebview(entry: PasteAuditEntry): string {
    const license = entry.sourceMatch?.license || 'GPL-3.0';
    const repo = entry.sourceMatch?.repository || 'External Project Match';
    const repoUrl = entry.sourceMatch?.url || '#';
    const projectLicense = 'MIT';

    const isForbidden =
      entry.riskLevel === 'FORBIDDEN' ||
      entry.riskLevel === 'HIGH' ||
      license.includes('GPL');

    const statusBadge = isForbidden ? 'INCOMPATIBLE' : 'COMPATIBLE';
    const statusBg = isForbidden ? '#f85149' : '#2ea043';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SchemAI Risk Card</title>
  <style>
    :root {
      --bg-dark: #0f141c;
      --card-bg: #161b22;
      --border-color: #30363d;
      --text-main: #f0f6fc;
      --text-muted: #8b949e;
      --gradient-start: #00d2ff;
      --gradient-end: #9254de;
    }
    body {
      margin: 0;
      padding: 16px;
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
    }
    /* Glowing Risk Banner */
    .risk-banner {
      background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
      border-radius: 12px;
      padding: 20px;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 210, 255, 0.25);
      margin-bottom: 16px;
    }
    .risk-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .risk-desc {
      font-size: 0.95rem;
      margin: 0 0 16px 0;
      opacity: 0.95;
      line-height: 1.5;
    }
    .btn-action {
      background: #0d1117;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 8px 18px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-block;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-action:hover {
      background: #21262d;
      transform: translateY(-1px);
    }
    /* Info Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .card-header {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 0.88rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .meta-label {
      color: var(--text-muted);
    }
    .meta-value {
      font-weight: 600;
      word-break: break-all;
    }
    a.repo-link {
      color: #58a6ff;
      text-decoration: none;
    }
    a.repo-link:hover {
      text-decoration: underline;
    }
    /* License Compatibility Matrix Table */
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 0.85rem;
      text-align: center;
    }
    .matrix-table th {
      color: var(--text-muted);
      padding: 8px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.03);
    }
    .matrix-table td {
      padding: 8px;
      border-top: 1px solid var(--border-color);
    }
    .badge-cell {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
    }
    .badge-green { background: #238636; }
    .badge-red { background: #da3633; }
  </style>
</head>
<body>
  <!-- Risk Banner -->
  <div class="risk-banner">
    <div class="risk-title">
      <span>🛡️</span> ${license} License Risk Detected
    </div>
    <div class="risk-desc">
      The highlighted code contains patterns matching <code>${license}</code>. 
      Integrating this snippet may enforce strict copyleft or incompatible terms on your entire project.
    </div>
    <a href="${repoUrl}" class="btn-action" target="_blank">View Details on GitHub</a>
  </div>

  <!-- Source Match Card -->
  <div class="card">
    <div class="card-header">
      <span>Source: GitHub Repository Match</span>
      <span style="font-size: 1.2rem;">🐙</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Repository</span>
      <span class="meta-value"><a class="repo-link" href="${repoUrl}" target="_blank">${repo}</a></span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Detected License</span>
      <span class="meta-value">${license}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Target File</span>
      <span class="meta-value">${entry.fileName}</span>
    </div>
  </div>

  <!-- Compatibility Matrix Card -->
  <div class="card">
    <div class="card-header">
      <span>License Compatibility Matrix</span>
      <span>🎛️</span>
    </div>
    <table class="matrix-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current Project</th>
          <th>Snippet</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="color: var(--text-muted);">License</td>
          <td><span class="badge-cell badge-green">${projectLicense}</span></td>
          <td><span class="badge-cell badge-red">${license}</span></td>
        </tr>
        <tr>
          <td style="color: var(--text-muted);">Compatibility</td>
          <td>-</td>
          <td><span class="badge-cell" style="background: ${statusBg};">${statusBadge}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }

  public dispose(): void {
    RiskCardPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
}
