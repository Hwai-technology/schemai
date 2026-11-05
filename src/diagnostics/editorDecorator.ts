import * as vscode from 'vscode';
import { AnalysisResult } from '../types';

export class EditorDecorator {
  private forbiddenDecorationType: vscode.TextEditorDecorationType;
  private warningDecorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.forbiddenDecorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: 'underline wavy #f85149',
      overviewRulerColor: '#f85149',
      overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    this.warningDecorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: 'underline wavy #d29922',
      overviewRulerColor: '#d29922',
      overviewRulerLane: vscode.OverviewRulerLane.Right
    });
  }

  public register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      this.forbiddenDecorationType,
      this.warningDecorationType
    );
  }

  public applyDecoration(
    editor: vscode.TextEditor,
    range: vscode.Range,
    result: AnalysisResult
  ): void {
    if (result.riskLevel === 'FORBIDDEN' || result.riskLevel === 'HIGH') {
      editor.setDecorations(this.forbiddenDecorationType, [range]);
    } else if (result.riskLevel === 'WARNING' || result.riskLevel === 'MEDIUM') {
      editor.setDecorations(this.warningDecorationType, [range]);
    }
  }

  public clearDecorations(editor: vscode.TextEditor): void {
    editor.setDecorations(this.forbiddenDecorationType, []);
    editor.setDecorations(this.warningDecorationType, []);
  }

  public dispose(): void {
    this.forbiddenDecorationType.dispose();
    this.warningDecorationType.dispose();
  }
}

