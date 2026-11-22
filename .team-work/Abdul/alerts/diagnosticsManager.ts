import * as vscode from 'vscode';

/**
 * Reference Code for Abdul (HU-11)
 * Manages VS Code DiagnosticCollection for reporting license risk.
 */
export class DiagnosticsManager {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('schemaAI');
  }

  public register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(this.diagnosticCollection);
  }

  public updateDiagnostic(
    uri: vscode.Uri,
    range: vscode.Range | undefined,
    result: any
  ): void {
    if (result.riskLevel === 'SAFE' || result.riskLevel === 'LOW') {
      this.clearDiagnosticsForUri(uri);
      return;
    }

    const targetRange = range || new vscode.Range(0, 0, 0, 50);

    let severity = vscode.DiagnosticSeverity.Warning;
    if (result.riskLevel === 'FORBIDDEN' || result.riskLevel === 'HIGH') {
      severity = vscode.DiagnosticSeverity.Error;
    } else if (result.riskLevel === 'UNKNOWN') {
      severity = vscode.DiagnosticSeverity.Information;
    }

    const message = `[SchemAI] ${result.riskLevel}: ${result.reason} (Source: ${result.sourceMatch?.repository || 'External'})`;
    const diagnostic = new vscode.Diagnostic(targetRange, message, severity);
    diagnostic.source = 'SchemAI';
    diagnostic.code = result.sourceMatch?.license || 'LICENSE-RISK';

    const currentDiagnostics = this.diagnosticCollection.get(uri) || [];
    this.diagnosticCollection.set(uri, [...currentDiagnostics, diagnostic]);
  }

  public clearDiagnosticsForUri(uri: vscode.Uri): void {
    this.diagnosticCollection.delete(uri);
  }

  public clearAll(): void {
    this.diagnosticCollection.clear();
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}

