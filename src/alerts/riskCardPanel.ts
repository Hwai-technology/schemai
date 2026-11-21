import type * as vscode from 'vscode';
import type { CodeFragment, RiskAssessment } from '../types';

/** The part of `vscode.WebviewPanel` used here, so tests can inject a fake. */
export interface PanelLike {
  title: string;
  webview: { html: string };
  reveal(column?: number): void;
  onDidDispose(listener: () => void): { dispose(): void };
  dispose(): void;
}

/** The part of `vscode.window` that creates webview panels. */
export interface PanelFactory {
  createWebviewPanel(
    viewType: string,
    title: string,
    column: number,
    options: { enableScripts: boolean; retainContextWhenHidden: boolean }
  ): PanelLike;
}

/** Same value as vscode.ViewColumn.Beside. */
export const VIEW_COLUMN_BESIDE = -2;

const VIEW_TYPE = 'schemaiRiskCard';

/** Escapes text for HTML content and attribute values; everything shown comes from GitHub or the user. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Returns the url when it is http(s), so it is safe to link; undefined otherwise. */
function httpUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

export function renderRiskCardHtml(assessment: RiskAssessment, fragment: CodeFragment): string {
  const { license, match } = assessment;
  const repository = escapeHtml(match.repository);
  const url = httpUrl(match.url);
  const source = url ? `<a href="${escapeHtml(url)}">${repository}</a>` : repository;
  const licenseName = license.name ? ` (${escapeHtml(license.name)})` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <title>SchemAI risk card</title>
  <style>
    body { color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); padding: 0 16px; }
    dt { font-weight: bold; margin-top: 8px; }
    pre { padding: 8px; overflow-x: auto; border: 1px solid var(--vscode-panel-border); }
  </style>
</head>
<body>
  <h2>SchemAI: ${escapeHtml(assessment.severity)} license risk</h2>
  <dl>
    <dt>License</dt><dd>${escapeHtml(license.spdxId)}${licenseName}</dd>
    <dt>Source</dt><dd>${source}</dd>
    <dt>Path</dt><dd>${escapeHtml(match.path)}</dd>
    <dt>Similarity</dt><dd>${Math.round(match.similarity * 100)} %</dd>
    <dt>Reason</dt><dd>${escapeHtml(assessment.reason)}</dd>
  </dl>
  <h3>Pasted code</h3>
  <pre><code>${escapeHtml(fragment.text)}</code></pre>
</body>
</html>`;
}

/**
 * Shows the risk card of an alert in one webview panel, reused while it is open.
 */
export class RiskCardPanel {
  private readonly factory: PanelFactory;
  private readonly column: number;
  private panel?: PanelLike;
  private disposeSubscription?: { dispose(): void };

  constructor(factory: PanelFactory, column = VIEW_COLUMN_BESIDE) {
    this.factory = factory;
    this.column = column;
  }

  public static create(): RiskCardPanel {
    // Loaded lazily because the real `vscode` module is only available inside the extension host.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    return new RiskCardPanel(vs.window);
  }

  public show(assessment: RiskAssessment, fragment: CodeFragment): void {
    const title = `SchemAI: ${assessment.license.spdxId} risk`;
    if (this.panel) {
      this.panel.reveal(this.column);
      this.panel.title = title;
    } else {
      // Scripts stay disabled: the card only displays data, and the CSP blocks them as well.
      this.panel = this.factory.createWebviewPanel(VIEW_TYPE, title, this.column, {
        enableScripts: false,
        retainContextWhenHidden: false
      });
      this.disposeSubscription = this.panel.onDidDispose(() => this.forgetPanel());
    }
    this.panel.webview.html = renderRiskCardHtml(assessment, fragment);
  }

  public dispose(): void {
    const panel = this.panel;
    this.forgetPanel();
    panel?.dispose();
  }

  private forgetPanel(): void {
    this.disposeSubscription?.dispose();
    this.disposeSubscription = undefined;
    this.panel = undefined;
  }
}

export function register(context: vscode.ExtensionContext): RiskCardPanel {
  const riskCard = RiskCardPanel.create();
  context.subscriptions.push(riskCard);
  return riskCard;
}
