import type * as vscode from 'vscode';
import type { AlertInput } from './diagnosticsManager';

export interface DecorationTypeFactory {
  createTextEditorDecorationType(
    options: vscode.DecorationRenderOptions
  ): vscode.TextEditorDecorationType;
}

export interface DecoratableEditor {
  document: { uri: vscode.Uri };
  setDecorations(
    type: vscode.TextEditorDecorationType,
    ranges: readonly vscode.Range[]
  ): void;
}

/** The part of `vscode.workspace` that reports closed documents. */
export interface DocumentCloseSource {
  onDidCloseTextDocument(listener: (doc: { uri: vscode.Uri }) => void): vscode.Disposable;
}

/** Same value as vscode.OverviewRulerLane.Right. */
export const OVERVIEW_RULER_LANE_RIGHT = 4;

/**
 * Underlines risky pasted code with wavy lines and marks it in the overview ruler.
 */
export class EditorDecorator {
  private readonly errorType: vscode.TextEditorDecorationType;
  private readonly warningType: vscode.TextEditorDecorationType;
  private readonly decoratedEditors = new Map<string, DecoratableEditor>();
  private readonly closeSubscription?: vscode.Disposable;

  constructor(factory: DecorationTypeFactory, closeSource?: DocumentCloseSource) {
    this.errorType = factory.createTextEditorDecorationType({
      textDecoration: 'underline wavy #f85149',
      overviewRulerColor: '#f85149',
      overviewRulerLane: OVERVIEW_RULER_LANE_RIGHT
    });
    this.warningType = factory.createTextEditorDecorationType({
      textDecoration: 'underline wavy #d29922',
      overviewRulerColor: '#d29922',
      overviewRulerLane: OVERVIEW_RULER_LANE_RIGHT
    });
    this.closeSubscription = closeSource?.onDidCloseTextDocument((doc) =>
      this.forget(doc.uri.toString())
    );
  }

  public static create(): EditorDecorator {
    // Loaded lazily because the real `vscode` module is only available inside the extension host.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    return new EditorDecorator(vs.window, vs.workspace);
  }

  public apply(editor: DecoratableEditor, alerts: AlertInput[]): void {
    const documentUri = editor.document.uri.toString();
    this.decoratedEditors.set(documentUri, editor);
    const errorRanges: vscode.Range[] = [];
    const warningRanges: vscode.Range[] = [];

    for (const alert of alerts) {
      if (alert.uri.toString() !== documentUri) {
        continue;
      }
      if (alert.severity === 'critical' || alert.severity === 'high') {
        errorRanges.push(alert.range);
      } else if (alert.severity === 'medium') {
        warningRanges.push(alert.range);
      }
    }

    editor.setDecorations(this.errorType, errorRanges);
    editor.setDecorations(this.warningType, warningRanges);
  }

  public clear(editor: DecoratableEditor): void {
    editor.setDecorations(this.errorType, []);
    editor.setDecorations(this.warningType, []);
  }

  public dispose(): void {
    this.closeSubscription?.dispose();
    this.errorType.dispose();
    this.warningType.dispose();
  }

  /** Clears the decorations of a closed document and stops tracking its editor. */
  private forget(documentUri: string): void {
    const editor = this.decoratedEditors.get(documentUri);
    if (!editor) {
      return;
    }
    this.clear(editor);
    this.decoratedEditors.delete(documentUri);
  }
}

export function register(context: vscode.ExtensionContext): EditorDecorator {
  const decorator = EditorDecorator.create();
  context.subscriptions.push(decorator);
  return decorator;
}
