import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { RiskSeverity } from '../../types';
import type { AlertInput } from '../../alerts/diagnosticsManager';
import {
  DecoratableEditor,
  DecorationTypeFactory,
  EditorDecorator
} from '../../alerts/editorDecorator';

interface FakeDecorationType {
  options: vscode.DecorationRenderOptions;
  disposeCalls: number;
  dispose(): void;
}

class FakeFactory implements DecorationTypeFactory {
  public readonly created: FakeDecorationType[] = [];

  public createTextEditorDecorationType(
    options: vscode.DecorationRenderOptions
  ): vscode.TextEditorDecorationType {
    const type: FakeDecorationType = {
      options,
      disposeCalls: 0,
      dispose() {
        this.disposeCalls++;
      }
    };
    this.created.push(type);
    return type as unknown as vscode.TextEditorDecorationType;
  }

  public typeWithColor(color: string): FakeDecorationType {
    const type = this.created.find((t) => t.options.overviewRulerColor === color);
    assert.ok(type, `no decoration type created with color ${color}`);
    return type;
  }
}

class FakeEditor implements DecoratableEditor {
  public readonly document: { uri: vscode.Uri };
  public readonly calls: { type: unknown; ranges: readonly vscode.Range[] }[] = [];

  constructor(uri: vscode.Uri) {
    this.document = { uri };
  }

  public setDecorations(
    type: vscode.TextEditorDecorationType,
    ranges: readonly vscode.Range[]
  ): void {
    this.calls.push({ type, ranges });
  }

  /** Ranges from the most recent setDecorations call for that type, or undefined if never set. */
  public rangesFor(type: FakeDecorationType): readonly vscode.Range[] | undefined {
    const matching = this.calls.filter((call) => call.type === type);
    return matching.length > 0 ? matching[matching.length - 1].ranges : undefined;
  }
}

const ERROR_COLOR = '#f85149';
const WARNING_COLOR = '#d29922';

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

describe('EditorDecorator (HU-11 T2)', () => {
  it('creates exactly two decoration types once, even when apply is called repeatedly', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///copied.ts'));

    decorator.apply(editor, [alert('high')]);
    decorator.apply(editor, [alert('medium')]);

    assert.strictEqual(factory.created.length, 2);
  });

  it('puts a high alert range in the error type and clears the warning type', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///copied.ts'));
    const input = alert('high');

    decorator.apply(editor, [input]);

    const errorRanges = editor.rangesFor(factory.typeWithColor(ERROR_COLOR));
    assert.strictEqual(errorRanges?.length, 1);
    assert.strictEqual(errorRanges[0], input.range);
    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(WARNING_COLOR)), []);
  });

  it('puts a medium alert range in the warning type', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///copied.ts'));
    const input = alert('medium');

    decorator.apply(editor, [input]);

    assert.strictEqual(editor.rangesFor(factory.typeWithColor(WARNING_COLOR))?.[0], input.range);
    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(ERROR_COLOR)), []);
  });

  it('does not decorate low or none alerts', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///copied.ts'));

    decorator.apply(editor, [alert('low'), alert('none')]);

    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(ERROR_COLOR)), []);
    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(WARNING_COLOR)), []);
  });

  it('ignores alerts that belong to another document', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///open.ts'));

    decorator.apply(editor, [alert('high', { uri: fakeUri('file:///other.ts') })]);

    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(ERROR_COLOR)), []);
    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(WARNING_COLOR)), []);
  });

  it('clear sets both decoration types to an empty list', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);
    const editor = new FakeEditor(fakeUri('file:///copied.ts'));
    decorator.apply(editor, [alert('high'), alert('medium')]);

    decorator.clear(editor);

    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(ERROR_COLOR)), []);
    assert.deepStrictEqual(editor.rangesFor(factory.typeWithColor(WARNING_COLOR)), []);
  });

  it('dispose disposes both decoration types', () => {
    const factory = new FakeFactory();
    const decorator = new EditorDecorator(factory);

    decorator.dispose();

    assert.deepStrictEqual(
      factory.created.map((type) => type.disposeCalls),
      [1, 1]
    );
  });
});
