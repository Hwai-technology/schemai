import type * as vscode from 'vscode';

interface QuickFixVscodeApi {
  readonly CodeAction: new (
    title: string,
    kind: vscode.CodeActionKind
  ) => vscode.CodeAction;
  readonly CodeActionKind: {
    readonly QuickFix: vscode.CodeActionKind;
  };
  readonly languages: Pick<typeof vscode.languages, 'registerCodeActionsProvider'>;
}

/**
 * Provides quick fixes for diagnostics created by SchemAI.
 */
export class SchemAIQuickFixProvider implements vscode.CodeActionProvider {
  public constructor(private readonly vscodeApi: QuickFixVscodeApi) {}

  public static readonly providedCodeActionKinds: vscode.CodeActionKind[] = [];

  public register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      this.vscodeApi.languages.registerCodeActionsProvider(
        [{ scheme: 'file' }, { scheme: 'untitled' }],
        this,
        { providedCodeActionKinds: [this.vscodeApi.CodeActionKind.QuickFix] }
      )
    );
  }

  public provideCodeActions(
    _document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.source === 'SchemAI')
      .flatMap((diagnostic) => [
        this.createAction('Add attribution comment', diagnostic),
        this.createAction('Ignore', diagnostic)
      ]);
  }

  private createAction(
    title: string,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new this.vscodeApi.CodeAction(
      title,
      this.vscodeApi.CodeActionKind.QuickFix
    );
    action.diagnostics = [diagnostic];
    return action;
  }
}
