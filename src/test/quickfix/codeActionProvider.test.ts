import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import { SchemAIQuickFixProvider } from '../../quickfix/codeActionProvider';

class FakeCodeAction {
  public diagnostics?: readonly vscode.Diagnostic[];
  public isPreferred?: boolean;

  public constructor(
    public readonly title: string,
    public readonly kind: string
  ) {}
}

class FakeWorkspaceEdit {}

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

const document = {
  uri: { toString: () => 'file:///copied.ts' }
} as unknown as vscode.TextDocument;

const range = {} as vscode.Range;
const token = {} as vscode.CancellationToken;

const diagnostic = (source: string): vscode.Diagnostic =>
  ({ code: 'GPL-3.0', source } as vscode.Diagnostic);

describe('SchemAIQuickFixProvider (HU-15 T1)', () => {
  it('offers attribution and ignore actions for a SchemAI diagnostic', () => {
    const provider = new SchemAIQuickFixProvider(vscodeApi as never);

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
    const provider = new SchemAIQuickFixProvider(vscodeApi as never);

    const actions = provider.provideCodeActions(
      document,
      range,
      { diagnostics: [diagnostic('ESLint')] } as unknown as vscode.CodeActionContext,
      token
    );

    assert.deepStrictEqual(actions, []);
  });
});
