import * as vscode from 'vscode';

/**
 * Reference Code for Sergio (HU-15)
 * VS Code CodeActionProvider offering attribution and replacement quick-fixes.
 */
export class SchemAIQuickFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  public register(context: vscode.ExtensionContext): void {
    const selector: vscode.DocumentSelector = [{ scheme: 'file' }, { scheme: 'untitled' }];
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(selector, this, {
        providedCodeActionKinds: SchemAIQuickFixProvider.providedCodeActionKinds
      })
    );
  }

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source === 'SchemAI') {
        const attributionAction = new vscode.CodeAction(
          'SchemAI: Add required license attribution header',
          vscode.CodeActionKind.QuickFix
        );
        attributionAction.diagnostics = [diagnostic];
        attributionAction.isPreferred = true;

        const edit = new vscode.WorkspaceEdit();
        const headerText = `/*\n * Source: External Open Source (${diagnostic.code})\n * Integrated via SchemAI Compliance Helper\n */\n`;
        edit.insert(document.uri, new vscode.Position(0, 0), headerText);
        attributionAction.edit = edit;

        actions.push(attributionAction);
      }
    }

    return actions;
  }
}

