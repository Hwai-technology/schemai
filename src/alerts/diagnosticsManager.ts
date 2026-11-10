import type * as vscode from 'vscode';
import type { RiskSeverity } from '../types';

// AlertInput will be mapped from RiskAssessment once COORD adds the shared types to src/types.ts.
export interface AlertInput {
  uri: vscode.Uri;
  range: vscode.Range;
  severity: RiskSeverity;
  license: string;
  sourceRepo: string;
  reason: string;
}

export interface DiagnosticPort {
  get(uri: vscode.Uri): readonly vscode.Diagnostic[] | undefined;
  set(uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[]): void;
  delete(uri: vscode.Uri): void;
  clear(): void;
  dispose(): void;
}

export type DiagnosticBuilder = (
  range: vscode.Range,
  message: string,
  severity: number
) => vscode.Diagnostic;

/** Same numeric values as vscode.DiagnosticSeverity. */
export const DIAGNOSTIC_SEVERITY = {
  Error: 0,
  Warning: 1,
  Information: 2
} as const;

const SEVERITY_BY_RISK: Record<RiskSeverity, number | undefined> = {
  critical: DIAGNOSTIC_SEVERITY.Error,
  high: DIAGNOSTIC_SEVERITY.Error,
  medium: DIAGNOSTIC_SEVERITY.Warning,
  low: DIAGNOSTIC_SEVERITY.Information,
  none: undefined
};

/**
 * Publishes license risk alerts to the Problems panel through a diagnostic collection.
 */
export class DiagnosticsManager {
  private readonly collection: DiagnosticPort;
  private readonly build: DiagnosticBuilder;

  constructor(collection: DiagnosticPort, build: DiagnosticBuilder) {
    this.collection = collection;
    this.build = build;
  }

  public static create(): DiagnosticsManager {
    const vs = require('vscode') as typeof vscode;
    return new DiagnosticsManager(
      vs.languages.createDiagnosticCollection('schemai'),
      (range, message, severity) => {
        const diagnostic = new vs.Diagnostic(range, message, severity);
        diagnostic.source = 'SchemAI';
        return diagnostic;
      }
    );
  }

  public report(alert: AlertInput): void {
    const severity = SEVERITY_BY_RISK[alert.severity];
    if (severity === undefined) {
      return;
    }

    const message =
      `[SchemAI] ${alert.severity.toUpperCase()}: ${alert.reason}` +
      ` — License: ${alert.license} — Source: ${alert.sourceRepo}`;
    const existing = this.collection.get(alert.uri) ?? [];
    this.collection.set(alert.uri, [...existing, this.build(alert.range, message, severity)]);
  }

  public clear(uri: vscode.Uri): void {
    this.collection.delete(uri);
  }

  public clearAll(): void {
    this.collection.clear();
  }

  public dispose(): void {
    this.collection.dispose();
  }
}

export function register(context: vscode.ExtensionContext): DiagnosticsManager {
  const manager = DiagnosticsManager.create();
  context.subscriptions.push(manager);
  return manager;
}
