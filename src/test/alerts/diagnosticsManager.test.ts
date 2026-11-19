import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { RiskSeverity } from '../../types';
import {
  AlertInput,
  AlertLookup,
  DiagnosticPort,
  DiagnosticsManager,
  DIAGNOSTIC_SEVERITY,
  DIAGNOSTIC_SOURCE
} from '../../alerts/diagnosticsManager';

interface FakeDiagnostic {
  range: vscode.Range;
  message: string;
  severity: number;
}

class FakeDiagnosticPort implements DiagnosticPort {
  public readonly entries = new Map<string, readonly vscode.Diagnostic[]>();

  public get(uri: vscode.Uri): readonly vscode.Diagnostic[] | undefined {
    return this.entries.get(uri.toString());
  }

  public set(uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[]): void {
    this.entries.set(uri.toString(), diagnostics);
  }

  public delete(uri: vscode.Uri): void {
    this.entries.delete(uri.toString());
  }

  public clear(): void {
    this.entries.clear();
  }

  public dispose(): void {
    this.entries.clear();
  }
}

const fakeBuilder = (range: vscode.Range, message: string, severity: number): vscode.Diagnostic =>
  ({ range, message, severity } as FakeDiagnostic as unknown as vscode.Diagnostic);

const fakeUri = (path: string): vscode.Uri => ({ toString: () => path } as any);

const alert = (severity: RiskSeverity, overrides: Partial<AlertInput> = {}): AlertInput => ({
  uri: fakeUri('file:///copied.ts'),
  range: {} as any,
  severity,
  license: 'GPL-3.0',
  sourceRepo: 'torvalds/linux',
  reason: 'Copyleft license is not compatible with the project policy',
  ...overrides
});

const diagnosticsFor = (port: FakeDiagnosticPort, uri: vscode.Uri): FakeDiagnostic[] =>
  (port.get(uri) ?? []) as unknown as FakeDiagnostic[];

describe('DiagnosticsManager (HU-11 T1)', () => {
  it('reports a high risk as one Error diagnostic on exactly the given range', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const input = alert('high');

    manager.report(input);

    const diagnostics = diagnosticsFor(port, input.uri);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].severity, DIAGNOSTIC_SEVERITY.Error);
    assert.strictEqual(diagnostics[0].range, input.range);
  });

  it('reports a medium risk as a Warning diagnostic', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const input = alert('medium');

    manager.report(input);

    const diagnostics = diagnosticsFor(port, input.uri);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].severity, DIAGNOSTIC_SEVERITY.Warning);
  });

  it('does not create a diagnostic when the risk is none', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const input = alert('none');

    manager.report(input);

    assert.strictEqual(diagnosticsFor(port, input.uri).length, 0);
  });

  it('keeps both diagnostics when two alerts hit the same document', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const first = alert('high', { range: {} as any });
    const second = alert('medium', { range: {} as any });

    manager.report(first);
    manager.report(second);

    const diagnostics = diagnosticsFor(port, first.uri);
    assert.strictEqual(diagnostics.length, 2);
    assert.strictEqual(diagnostics[0].range, first.range);
    assert.strictEqual(diagnostics[1].range, second.range);
  });

  it('clears the diagnostics of one document and leaves other documents untouched', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const cleared = alert('high', { uri: fakeUri('file:///cleared.ts') });
    const kept = alert('high', { uri: fakeUri('file:///kept.ts') });
    manager.report(cleared);
    manager.report(kept);

    manager.clear(cleared.uri);

    assert.strictEqual(diagnosticsFor(port, cleared.uri).length, 0);
    assert.strictEqual(diagnosticsFor(port, kept.uri).length, 1);
  });

  it('includes the license and the source repository in the message', () => {
    const port = new FakeDiagnosticPort();
    const manager = new DiagnosticsManager(port, fakeBuilder);
    const input = alert('critical', { license: 'AGPL-3.0', sourceRepo: 'mongodb/mongo' });

    manager.report(input);

    const [diagnostic] = diagnosticsFor(port, input.uri);
    assert.ok(diagnostic.message.includes('AGPL-3.0'), diagnostic.message);
    assert.ok(diagnostic.message.includes('mongodb/mongo'), diagnostic.message);
  });
});

/** Fake range from (startLine, 0) to (endLine, 10); VS Code hands quick fixes a copy, never the same object. */
const linesRange = (startLine: number, endLine: number): vscode.Range =>
  ({
    start: { line: startLine, character: 0 },
    end: { line: endLine, character: 10 }
  } as unknown as vscode.Range);

describe('DiagnosticsManager as AlertLookup (HU-15 T1)', () => {
  it('exposes the diagnostic source used by every SchemAI diagnostic', () => {
    assert.strictEqual(DIAGNOSTIC_SOURCE, 'SchemAI');
  });

  it('findAlert returns the alert reported for that uri and range', () => {
    const manager = new DiagnosticsManager(new FakeDiagnosticPort(), fakeBuilder);
    const input = alert('high', { range: linesRange(3, 5) });
    manager.report(input);

    const lookup: AlertLookup = manager;

    assert.strictEqual(lookup.findAlert(fakeUri('file:///copied.ts'), linesRange(3, 5)), input);
  });

  it('findAlert returns undefined for another range or another document', () => {
    const manager = new DiagnosticsManager(new FakeDiagnosticPort(), fakeBuilder);
    manager.report(alert('high', { range: linesRange(3, 5) }));

    assert.strictEqual(manager.findAlert(fakeUri('file:///copied.ts'), linesRange(4, 5)), undefined);
    assert.strictEqual(manager.findAlert(fakeUri('file:///other.ts'), linesRange(3, 5)), undefined);
  });

  it('findAlert returns undefined after clear(uri) and clearAll()', () => {
    const manager = new DiagnosticsManager(new FakeDiagnosticPort(), fakeBuilder);
    manager.report(alert('high', { range: linesRange(3, 5) }));
    manager.report(alert('high', { uri: fakeUri('file:///other.ts'), range: linesRange(1, 1) }));

    manager.clear(fakeUri('file:///copied.ts'));
    assert.strictEqual(manager.findAlert(fakeUri('file:///copied.ts'), linesRange(3, 5)), undefined);
    assert.ok(manager.findAlert(fakeUri('file:///other.ts'), linesRange(1, 1)));

    manager.clearAll();
    assert.strictEqual(manager.findAlert(fakeUri('file:///other.ts'), linesRange(1, 1)), undefined);
  });
});
