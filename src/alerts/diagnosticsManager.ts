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
  sourceUrl?: string;
  /** Similarity with the source, from 0 to 1. */
  similarity?: number;
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

/** `source` of every SchemAI diagnostic; quick fixes use it to recognise them. */
export const DIAGNOSTIC_SOURCE = 'SchemAI';

/** Finds the alert behind a reported diagnostic, e.g. to build its quick fixes. */
export interface AlertLookup {
  findAlert(uri: vscode.Uri, range: vscode.Range): AlertInput | undefined;
}

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

const samePosition = (a: vscode.Position, b: vscode.Position): boolean =>
  a.line === b.line && a.character === b.character;

/**
 * Publishes license risk alerts to the Problems panel through a diagnostic collection.
 */
export class DiagnosticsManager implements AlertLookup {
  private readonly collection: DiagnosticPort;
  private readonly build: DiagnosticBuilder;
  /** Reported alerts by document (uri.toString()), so quick fixes can read their data. */
  private readonly alertsByDocument = new Map<string, AlertInput[]>();

  constructor(collection: DiagnosticPort, build: DiagnosticBuilder) {
    this.collection = collection;
    this.build = build;
  }

  public static create(): DiagnosticsManager {
    // Loaded lazily because the real `vscode` module is only available inside the extension host.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    return new DiagnosticsManager(
      vs.languages.createDiagnosticCollection('schemai'),
      (range, message, severity) => {
        const diagnostic = new vs.Diagnostic(range, message, severity);
        diagnostic.source = DIAGNOSTIC_SOURCE;
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

    const key = alert.uri.toString();
    this.alertsByDocument.set(key, [...(this.alertsByDocument.get(key) ?? []), alert]);
  }

  /** Matches by position: VS Code passes quick fixes a copy of the diagnostic range. */
  public findAlert(uri: vscode.Uri, range: vscode.Range): AlertInput | undefined {
    return this.alertsByDocument
      .get(uri.toString())
      ?.find((alert) => samePosition(alert.range.start, range.start) && samePosition(alert.range.end, range.end));
  }

  public clear(uri: vscode.Uri): void {
    this.collection.delete(uri);
    this.alertsByDocument.delete(uri.toString());
  }

  public clearAll(): void {
    this.collection.clear();
    this.alertsByDocument.clear();
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
