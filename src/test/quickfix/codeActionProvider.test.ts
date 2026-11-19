import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { AlertInput, AlertLookup } from '../../alerts/diagnosticsManager';
import { IGNORE_ALERT_COMMAND, SchemAIQuickFixProvider } from '../../quickfix/codeActionProvider';

class FakeCodeAction {
  public diagnostics?: readonly vscode.Diagnostic[];
  public isPreferred?: boolean;
  public edit?: FakeWorkspaceEdit;
  public command?: vscode.Command;

  public constructor(
    public readonly title: string,
    public readonly kind: string
  ) {}
}

/** Fake `vscode.WorkspaceEdit`: records every insert. */
class FakeWorkspaceEdit {
  public readonly inserts: { uri: unknown; position: FakePosition; text: string }[] = [];

  public insert(uri: unknown, position: FakePosition, text: string): void {
    this.inserts.push({ uri, position, text });
  }
}

class FakePosition {
  public constructor(
    public readonly line: number,
    public readonly character: number
  ) {}
}

const vscodeApi = {
  CodeAction: FakeCodeAction,
  CodeActionKind: { QuickFix: 'quickfix' },
  WorkspaceEdit: FakeWorkspaceEdit,
  Position: FakePosition
};

const documentFor = (languageId: string): vscode.TextDocument =>
  ({ uri: { toString: () => 'file:///copied.ts' }, languageId } as unknown as vscode.TextDocument);

const document = documentFor('typescript');

const range = {} as vscode.Range;
const token = {} as vscode.CancellationToken;

/** Flagged code on lines 4..6 (0-based); the attribution line goes above line 4. */
const alertRange = {
  start: { line: 4, character: 2 },
  end: { line: 6, character: 1 }
} as unknown as vscode.Range;

const diagnostic = (source: string): vscode.Diagnostic =>
  ({ code: 'GPL-3.0', source, range: alertRange } as unknown as vscode.Diagnostic);

const reportedAlert = (overrides: Partial<AlertInput> = {}): AlertInput => ({
  uri: document.uri,
  range: alertRange,
  severity: 'high',
  license: 'GPL-3.0',
  sourceRepo: 'torvalds/linux',
  sourceUrl: 'https://github.com/torvalds/linux/blob/master/kernel/fork.c',
  reason: 'Copyleft license is not compatible with the project license',
  ...overrides
});

/** Fake AlertLookup: knows one alert, or none. */
const lookupOf = (alert?: AlertInput): AlertLookup => ({ findAlert: () => alert });

const actionsFor = (
  lookup: AlertLookup,
  diagnostics: vscode.Diagnostic[],
  doc: vscode.TextDocument = document
): FakeCodeAction[] =>
  new SchemAIQuickFixProvider(vscodeApi as never, lookup).provideCodeActions(
    doc,
    range,
    { diagnostics } as unknown as vscode.CodeActionContext,
    token
  ) as unknown as FakeCodeAction[];

const attributionLine = (actions: FakeCodeAction[]): string => {
  const attribution = actions.find((action) => action.title === 'Add attribution comment');
  assert.ok(attribution?.edit, 'expected an attribution action with an edit');
  assert.strictEqual(attribution.edit.inserts.length, 1);
  return attribution.edit.inserts[0].text;
};

describe('SchemAIQuickFixProvider (HU-15 T1)', () => {
  it('offers attribution and ignore actions for a SchemAI diagnostic', () => {
    const provider = new SchemAIQuickFixProvider(vscodeApi as never, lookupOf(reportedAlert()));

    const actions = provider.provideCodeActions(
      document,
      range,
      { diagnostics: [diagnostic('SchemAI')] } as unknown as vscode.CodeActionContext,
      token
    );

    assert.deepStrictEqual(
      actions.map((action: vscode.CodeAction) => action.title),
      ['Add attribution comment', 'Ignore']
    );
  });

  it('does not offer actions for diagnostics from other extensions', () => {
    const provider = new SchemAIQuickFixProvider(vscodeApi as never, lookupOf(reportedAlert()));

    const actions = provider.provideCodeActions(
      document,
      range,
      { diagnostics: [diagnostic('ESLint')] } as unknown as vscode.CodeActionContext,
      token
    );

    assert.deepStrictEqual(actions, []);
  });
});

describe('SchemAIQuickFixProvider: attribution edit and ignore command (HU-15 T1)', () => {
  it('inserts one attribution line above the alert, with // for TypeScript and # for Python', () => {
    const actions = actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI')]);
    const attribution = actions.find((action) => action.title === 'Add attribution comment');

    const insert = attribution?.edit?.inserts[0];
    assert.strictEqual(insert?.uri, document.uri);
    assert.deepStrictEqual(insert?.position, new FakePosition(4, 0));
    assert.strictEqual(
      insert?.text,
      '// Source: torvalds/linux (GPL-3.0) https://github.com/torvalds/linux/blob/master/kernel/fork.c' +
        ' — added by SchemAI\n'
    );

    const python = attributionLine(
      actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI')], documentFor('python'))
    );
    assert.ok(python.startsWith('# Source: torvalds/linux (GPL-3.0) '), python);
  });

  it('wraps the comment for languages without line comments', () => {
    const html = attributionLine(
      actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI')], documentFor('html'))
    );
    const css = attributionLine(
      actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI')], documentFor('css'))
    );

    assert.match(html, /^<!-- Source: torvalds\/linux \(GPL-3\.0\) .* — added by SchemAI -->\n$/);
    assert.match(css, /^\/\* Source: torvalds\/linux \(GPL-3\.0\) .* — added by SchemAI \*\/\n$/);
  });

  it('leaves a non-http source url out of the comment', () => {
    const text = attributionLine(
      actionsFor(lookupOf(reportedAlert({ sourceUrl: 'javascript:alert(1)' })), [diagnostic('SchemAI')])
    );

    assert.strictEqual(text, '// Source: torvalds/linux (GPL-3.0) — added by SchemAI\n');
  });

  it('keeps untrusted text on one line and inside the comment', () => {
    const text = attributionLine(
      actionsFor(
        lookupOf(reportedAlert({ sourceRepo: 'evil/repo */\nrm -rf / <!--', sourceUrl: undefined })),
        [diagnostic('SchemAI')],
        documentFor('css')
      )
    );

    assert.strictEqual(text.split('\n').length, 2, text);
    assert.strictEqual(text.indexOf('*/'), text.lastIndexOf('*/'), text);
  });

  it('offers no attribution when the alert is unknown, but still offers Ignore', () => {
    const actions = actionsFor(lookupOf(undefined), [diagnostic('SchemAI')]);

    assert.deepStrictEqual(
      actions.map((action) => action.title),
      ['Ignore']
    );
  });

  it('Ignore runs schemaAI.ignoreAlert with the document uri and the diagnostic range', () => {
    const actions = actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI')]);
    const ignore = actions.find((action) => action.title === 'Ignore');

    assert.strictEqual(IGNORE_ALERT_COMMAND, 'schemaAI.ignoreAlert');
    assert.deepStrictEqual(ignore?.command, {
      command: 'schemaAI.ignoreAlert',
      title: 'Ignore',
      arguments: [document.uri, alertRange]
    });
  });

  it('marks the attribution as the preferred quick fix, and ignores other sources', () => {
    const actions = actionsFor(lookupOf(reportedAlert()), [diagnostic('SchemAI'), diagnostic('ESLint')]);

    assert.deepStrictEqual(
      actions.map((action) => [action.title, action.isPreferred === true]),
      [
        ['Add attribution comment', true],
        ['Ignore', false]
      ]
    );
  });
});
