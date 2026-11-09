import * as vscode from 'vscode';

/**
 * Reference Code for Abdul (HU-12)
 * Live Interactive Webview Risk Card displaying full metadata and compatibility table.
 */
export class RiskCardPanel {
  public static currentPanel: RiskCardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, entry: any) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this.update(entry);
  }

  public static show(entry: any): RiskCardPanel {
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

  public update(entry: any): void {
    this._panel.title = `SchemAI: ${entry.sourceMatch?.license || 'License'} Risk`;
    this._panel.webview.html = this.getHtmlForWebview(entry);
  }

  private getHtmlForWebview(entry: any): string {
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
  <title>SchemAI Risk Card</title>
  <style>
    body { background: #0f141c; color: #f0f6fc; font-family: sans-serif; padding: 16px; }
    .risk-banner { background: linear-gradient(135deg, #00d2ff, #9254de); border-radius: 12px; padding: 16px; color: white; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px; margin-top: 12px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; background: ${statusBg}; color: white; }
  </style>
</head>
<body>
  <div class="risk-banner">
    <h2>🛡️ ${license} License Risk Detected</h2>
    <p>Target file: <b>${entry.fileName}</b></p>
  </div>
  <div class="card">
    <p>Source Repo: <a href="${repoUrl}" target="_blank" style="color: #58a6ff;">${repo}</a></p>
    <p>Compatibility with ${projectLicense}: <span class="badge">${statusBadge}</span></p>
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
