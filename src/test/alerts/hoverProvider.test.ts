import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { RiskSeverity } from '../../types';
import type { AlertInput } from '../../alerts/diagnosticsManager';
import { AlertHoverProvider, buildHoverMarkdown } from '../../alerts/hoverProvider';

interface FakeHover {
  markdown: string;
  range: vscode.Range;
}

const fakeBuild = (markdown: string, range: vscode.Range): vscode.Hover =>
  ({ markdown, range } as FakeHover as unknown as vscode.Hover);

const fakeUri = (path: string): vscode.Uri => ({ toString: () => path } as any);

/** Fake range covering whole lines `startLine..endLine`. */
const linesRange = (startLine: number, endLine: number): vscode.Range =>
  ({
    start: { line: startLine },
    end: { line: endLine },
    contains: (position: vscode.Position) =>
      position.line >= startLine && position.line <= endLine
  } as unknown as vscode.Range);

const atLine = (line: number): vscode.Position => ({ line, character: 0 } as vscode.Position);

const COPIED = 'file:///copied.ts';

const alert = (severity: RiskSeverity, overrides: Partial<AlertInput> = {}): AlertInput => ({
  uri: fakeUri(COPIED),
  range: linesRange(10, 14),
  severity,
  license: 'GPL-3.0',
  sourceRepo: 'owner/repo',
  sourceUrl: 'https://github.com/owner/repo',
  similarity: 0.87,
  reason: 'Copyleft license is not compatible with the project license',
  ...overrides
});

const hoverAt = (provider: AlertHoverProvider, uri: string, line: number): FakeHover | undefined =>
  provider.provideHover({ uri: fakeUri(uri) }, atLine(line)) as FakeHover | undefined;

describe('AlertHoverProvider (HU-12 T1)', () => {
  it('hovering inside a high alert shows the license, the source link and the similarity', () => {
    const provider = new AlertHoverProvider(fakeBuild);
    const input = alert('high');
    provider.update(fakeUri(COPIED), [input]);

    const hover = hoverAt(provider, COPIED, 12);

    assert.ok(hover, 'expected a hover inside the alert range');
    assert.strictEqual(hover.range, input.range);
    assert.ok(hover.markdown.includes('`GPL-3.0`'), hover.markdown);
    assert.ok(hover.markdown.includes('[owner/repo](https://github.com/owner/repo)'), hover.markdown);
    assert.ok(hover.markdown.includes('87 %'), hover.markdown);
  });

  it('returns undefined when hovering outside every alert range', () => {
    const provider = new AlertHoverProvider(fakeBuild);
    provider.update(fakeUri(COPIED), [alert('high')]);

    assert.strictEqual(hoverAt(provider, COPIED, 3), undefined);
  });

  it('returns undefined when hovering in another document', () => {
    const provider = new AlertHoverProvider(fakeBuild);
    provider.update(fakeUri(COPIED), [alert('high')]);

    assert.strictEqual(hoverAt(provider, 'file:///other.ts', 12), undefined);
  });

  it('does not show a hover for low or none alerts', () => {
    const provider = new AlertHoverProvider(fakeBuild);
    provider.update(fakeUri(COPIED), [alert('low'), alert('none')]);

    assert.strictEqual(hoverAt(provider, COPIED, 12), undefined);
  });

  it('returns undefined after clear(uri)', () => {
    const provider = new AlertHoverProvider(fakeBuild);
    provider.update(fakeUri(COPIED), [alert('high')]);

    provider.clear(fakeUri(COPIED));

    assert.strictEqual(hoverAt(provider, COPIED, 12), undefined);
  });

  it('escapes untrusted GitHub text and only links http(s) source urls', () => {
    const markdown = buildHoverMarkdown(
      alert('high', {
        reason: 'Copied from [click](command:evil)',
        sourceUrl: 'command:evil'
      })
    );

    assert.ok(!markdown.includes('[click](command:evil)'), markdown);
    assert.ok(markdown.includes('\\[click\\]\\(command:evil\\)'), markdown);
    assert.ok(markdown.includes('- Source: owner/repo'), markdown);
    assert.ok(!markdown.includes('](command:'), markdown);
  });
});
