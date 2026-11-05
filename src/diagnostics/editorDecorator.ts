import * as vscode from 'vscode';
import { AnalysisResult } from '../types';

export class EditorDecorator {
  private forbiddenDecorationType: vscode.TextEditorDecorationType;
  private warningDecorationType: vscode.TextEditorDecorationType;
  private codeBoxDecorationType: vscode.TextEditorDecorationType;

  constructor() {
    // 1. Text underline for problem areas
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

    // 2. Glowing Code Box decoration matching the UI screenshot
    this.codeBoxDecorationType = vscode.window.createTextEditorDecorationType({
      border: '1px solid rgba(248, 81, 73, 0.75)',
      borderRadius: '6px',
      backgroundColor: 'rgba(248, 81, 73, 0.05)',
      isWholeLine: true,
      overviewRulerColor: 'rgba(248, 81, 73, 0.8)',
      overviewRulerLane: vscode.OverviewRulerLane.Full
    });
  }

  public register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      this.forbiddenDecorationType,
      this.warningDecorationType,
      this.codeBoxDecorationType
    );
  }

  public applyDecoration(
    editor: vscode.TextEditor,
    range: vscode.Range,
    result: AnalysisResult
  ): void {
    if (result.riskLevel === 'FORBIDDEN' || result.riskLevel === 'HIGH') {
      editor.setDecorations(this.forbiddenDecorationType, [range]);
      editor.setDecorations(this.codeBoxDecorationType, [range]);
    } else if (result.riskLevel === 'WARNING' || result.riskLevel === 'MEDIUM') {
      editor.setDecorations(this.warningDecorationType, [range]);
      editor.setDecorations(this.codeBoxDecorationType, []);
    } else {
      this.clearDecorations(editor);
    }
  }

  public clearDecorations(editor: vscode.TextEditor): void {
    editor.setDecorations(this.forbiddenDecorationType, []);
    editor.setDecorations(this.warningDecorationType, []);
    editor.setDecorations(this.codeBoxDecorationType, []);
  }

  public dispose(): void {
    this.forbiddenDecorationType.dispose();
    this.warningDecorationType.dispose();
    this.codeBoxDecorationType.dispose();
  }
}
