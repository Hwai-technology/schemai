import type * as vscode from 'vscode';
import { DIAGNOSTIC_SOURCE } from '../alerts/diagnosticsManager';
import type { AlertInput, AlertLookup } from '../alerts/diagnosticsManager';

/** Marks the alert as a false positive; COORD registers it (HistoryManager.markFalsePositive). */
export const IGNORE_ALERT_COMMAND = 'schemaAI.ignoreAlert';

interface QuickFixVscodeApi {
  readonly CodeAction: new (
    title: string,
    kind: vscode.CodeActionKind
  ) => vscode.CodeAction;
  readonly CodeActionKind: {
    readonly QuickFix: vscode.CodeActionKind;
  };
  readonly WorkspaceEdit: new () => vscode.WorkspaceEdit;
  readonly Position: new (line: number, character: number) => vscode.Position;
  readonly languages: Pick<typeof vscode.languages, 'registerCodeActionsProvider'>;
}

/** Comment delimiters by languageId; anything not listed uses `//`. */
const COMMENT_STYLES: Readonly<Record<string, readonly [string, string]>> = {
  python: ['#', ''],
  shellscript: ['#', ''],
  ruby: ['#', ''],
  yaml: ['#', ''],
  perl: ['#', ''],
  r: ['#', ''],
  sql: ['--', ''],
  lua: ['--', ''],
  html: ['<!--', ' -->'],
  xml: ['<!--', ' -->'],
  markdown: ['<!--', ' -->'],
  css: ['/*', ' */']
};
const DEFAULT_COMMENT_STYLE = ['//', ''] as const;

/** Returns the url only if it is http(s), so the comment never carries other schemes. */
function httpUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * One comment line crediting the source. The repo, license and url come from GitHub, so they
 * are kept on one line and cannot close a block comment early.
 */
function attributionComment(alert: AlertInput, languageId: string): string {
  const [open, close] = COMMENT_STYLES[languageId] ?? DEFAULT_COMMENT_STYLE;
  const url = httpUrl(alert.sourceUrl);
  const body = `Source: ${alert.sourceRepo} (${alert.license})${url ? ` ${url}` : ''}`
    .replace(/[\r\n]+/g, ' ')
    .replace(/\*\//g, '* /')
    .replace(/-->/g, '-- >');
  return `${open} ${body} — added by SchemAI${close}\n`;
}

/**
 * Provides quick fixes for diagnostics created by SchemAI.
 */
export class SchemAIQuickFixProvider implements vscode.CodeActionProvider {
  public constructor(
    private readonly vscodeApi: QuickFixVscodeApi,
    private readonly alerts: AlertLookup
  ) {}

  /** Read lazily: `CodeActionKind` only exists in the real `vscode` module. */
  public static get providedCodeActionKinds(): vscode.CodeActionKind[] {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    return [vs.CodeActionKind.QuickFix];
  }

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
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.source === DIAGNOSTIC_SOURCE)
      .flatMap((diagnostic) => {
        const alert = this.alerts.findAlert(document.uri, diagnostic.range);
        const attribution = alert ? [this.createAttributionAction(document, diagnostic, alert)] : [];
        return [...attribution, this.createIgnoreAction(document, diagnostic)];
      });
  }

  /** Inserts the attribution comment above the flagged code; existing code is never replaced. */
  private createAttributionAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    alert: AlertInput
  ): vscode.CodeAction {
    const action = this.createAction('Add attribution comment', diagnostic);
    const edit = new this.vscodeApi.WorkspaceEdit();
    edit.insert(
      document.uri,
      new this.vscodeApi.Position(diagnostic.range.start.line, 0),
      attributionComment(alert, document.languageId)
    );
    action.edit = edit;
    action.isPreferred = true;
    return action;
  }

  private createIgnoreAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = this.createAction('Ignore', diagnostic);
    action.command = {
      command: IGNORE_ALERT_COMMAND,
      title: 'Ignore',
      arguments: [document.uri, diagnostic.range]
    };
    return action;
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
