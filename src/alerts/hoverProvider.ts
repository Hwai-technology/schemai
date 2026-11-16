import type * as vscode from 'vscode';
import type { AlertInput } from './diagnosticsManager';

export type HoverBuilder = (markdown: string, range: vscode.Range) => vscode.Hover;

/** Escapes characters that Markdown would interpret; repo names and reasons come from GitHub. */
function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_[\]()#!<>]/g, '\\$&');
}

/** Returns the url ready for a Markdown link, or undefined unless it is http(s). */
function safeLinkUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return undefined;
  }
  // Parentheses would end the Markdown link destination early.
  return parsed.href.replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function buildHoverMarkdown(alert: AlertInput): string {
  const repo = escapeMarkdown(alert.sourceRepo);
  const url = safeLinkUrl(alert.sourceUrl);
  const lines = [
    `**SchemAI: ${alert.severity} license risk**`,
    `- License: \`${alert.license}\``,
    `- Source: ${url ? `[${repo}](${url})` : repo}`
  ];
  if (alert.similarity !== undefined) {
    lines.push(`- Similarity: ${Math.round(alert.similarity * 100)} %`);
  }
  lines.push(`- ${escapeMarkdown(alert.reason)}`);
  return lines.join('\n');
}

const HOVER_SEVERITIES = new Set(['critical', 'high', 'medium']);

/**
 * Shows the license risk summary when hovering over a flagged range.
 */
export class AlertHoverProvider {
  private readonly build: HoverBuilder;
  private readonly alertsByDocument = new Map<string, AlertInput[]>();

  constructor(build: HoverBuilder) {
    this.build = build;
  }

  public static create(): AlertHoverProvider {
    // Loaded lazily because the real `vscode` module is only available inside the extension host.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    // The MarkdownString stays untrusted (no isTrusted), so command links never run.
    return new AlertHoverProvider((markdown, range) => new vs.Hover(new vs.MarkdownString(markdown), range));
  }

  public update(uri: vscode.Uri, alerts: AlertInput[]): void {
    this.alertsByDocument.set(
      uri.toString(),
      alerts.filter((alert) => HOVER_SEVERITIES.has(alert.severity))
    );
  }

  public clear(uri: vscode.Uri): void {
    this.alertsByDocument.delete(uri.toString());
  }

  public provideHover(
    document: { uri: vscode.Uri },
    position: vscode.Position
  ): vscode.Hover | undefined {
    const alerts = this.alertsByDocument.get(document.uri.toString()) ?? [];
    const alert = alerts.find((candidate) => candidate.range.contains(position));
    return alert ? this.build(buildHoverMarkdown(alert), alert.range) : undefined;
  }
}

export function register(context: vscode.ExtensionContext): AlertHoverProvider {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vs = require('vscode') as typeof vscode;
  const provider = AlertHoverProvider.create();
  context.subscriptions.push(
    vs.languages.registerHoverProvider([{ scheme: 'file' }, { scheme: 'untitled' }], provider)
  );
  return provider;
}
