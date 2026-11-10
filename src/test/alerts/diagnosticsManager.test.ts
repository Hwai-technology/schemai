import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { RiskSeverity } from '../../types';
import {
  AlertInput,
  DiagnosticPort,
  DiagnosticsManager,
  DIAGNOSTIC_SEVERITY
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
