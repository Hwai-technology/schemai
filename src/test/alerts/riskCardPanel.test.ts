import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { CodeFragment, RiskAssessment } from '../../types';
import {
  PanelFactory,
  PanelLike,
  renderRiskCardHtml,
  RiskCardPanel
} from '../../alerts/riskCardPanel';

/** Fake `vscode.WebviewPanel`: records reveal calls and lets the test fire onDidDispose. */
class FakePanel implements PanelLike {
  public title: string;
  public readonly webview = { html: '' };
  public readonly revealCalls: (number | undefined)[] = [];
  private readonly disposeListeners = new Set<() => void>();

  constructor(title: string) {
    this.title = title;
  }

  public reveal(column?: number): void {
    this.revealCalls.push(column);
  }

  public onDidDispose(listener: () => void): { dispose(): void } {
    this.disposeListeners.add(listener);
    return { dispose: () => this.disposeListeners.delete(listener) };
  }

  public dispose(): void {
    this.fireDispose();
  }

  /** Simulates the user closing the panel. */
  public fireDispose(): void {
    [...this.disposeListeners].forEach((listener) => listener());
  }
}

/** Fake `vscode.window`: counts createWebviewPanel calls and keeps the created panels. */
class FakeFactory implements PanelFactory {
  public readonly panels: FakePanel[] = [];
  public readonly options: { enableScripts: boolean; retainContextWhenHidden: boolean }[] = [];

  public createWebviewPanel(
    _viewType: string,
    title: string,
    _column: number,
    options: { enableScripts: boolean; retainContextWhenHidden: boolean }
  ): PanelLike {
    const panel = new FakePanel(title);
    this.panels.push(panel);
    this.options.push(options);
    return panel;
  }
}

const fragment = (overrides: Partial<CodeFragment> = {}): CodeFragment => ({
  text: 'function add(a, b) {\n  return a + b;\n}\n',
  languageId: 'javascript',
  uri: { toString: () => 'file:///copied.js' } as unknown as vscode.Uri,
  range: {} as vscode.Range,
  ...overrides
});

const assessment = (
  overrides: Partial<RiskAssessment> = {},
  matchOverrides: Partial<RiskAssessment['match']> = {}
): RiskAssessment => ({
  severity: 'high',
  reason: 'Copyleft license is not compatible with the project license',
  license: { spdxId: 'GPL-3.0', name: 'GNU General Public License v3.0' },
  match: {
    repository: 'owner/repo',
    url: 'https://github.com/owner/repo/blob/main/src/x.ts',
    path: 'src/x.ts',
    similarity: 0.87,
    ...matchOverrides
  },
  ...overrides
});

describe('Risk card detail view (HU-12 T2)', () => {
  describe('renderRiskCardHtml', () => {
    it('shows the repository as a link to the match url, the license id and the similarity', () => {
      const html = renderRiskCardHtml(assessment(), fragment());

      assert.ok(
        html.includes('<a href="https://github.com/owner/repo/blob/main/src/x.ts">owner/repo</a>'),
        html
      );
      assert.ok(html.includes('GPL-3.0'), html);
      assert.ok(html.includes('87 %'), html);
      assert.ok(html.includes('src/x.ts'), html);
    });

    it('escapes the pasted code, so a script in it is shown as text and never runs', () => {
      const html = renderRiskCardHtml(
        assessment(),
        fragment({ text: '<script>alert(1)</script>' })
      );

      assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), html);
      assert.ok(!html.toLowerCase().includes('<script'), html);
    });

    it('escapes untrusted repository and reason text, and only links http(s) urls', () => {
      const payload = '<img src=x onerror=alert(1)>';
      const html = renderRiskCardHtml(
        assessment(
          { reason: `${payload} Tom's "code" & more` },
          { repository: payload, url: 'javascript:alert(1)' }
        ),
        fragment()
      );

      assert.ok(!html.includes('<img'), html);
      assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), html);
      assert.ok(!html.includes(`Tom's`), html);
      assert.ok(!html.includes('"code"'), html);
      assert.ok(html.includes('&amp; more'), html);
      assert.ok(!html.includes('javascript:alert(1)"'), html);
      assert.ok(!/<a\s/i.test(html), html);
    });

    it('declares a Content-Security-Policy with default-src none', () => {
      const html = renderRiskCardHtml(assessment(), fragment());

      assert.match(
        html,
        /<meta http-equiv="Content-Security-Policy" content="default-src 'none';/
      );
    });
  });

  describe('RiskCardPanel', () => {
    it('reuses one panel: the second show() reveals it and renders the second assessment', () => {
      const factory = new FakeFactory();
      const card = new RiskCardPanel(factory);

      card.show(assessment(), fragment());
      card.show(assessment({ license: { spdxId: 'MPL-2.0' } }), fragment());

      assert.strictEqual(factory.panels.length, 1);
      assert.strictEqual(factory.panels[0].revealCalls.length, 1);
      assert.ok(factory.panels[0].webview.html.includes('MPL-2.0'));
      assert.ok(!factory.panels[0].webview.html.includes('GPL-3.0'));
    });

    it('creates a new panel after the user closes the previous one', () => {
      const factory = new FakeFactory();
      const card = new RiskCardPanel(factory);
      card.show(assessment(), fragment());

      factory.panels[0].fireDispose();
      card.show(assessment(), fragment());

      assert.strictEqual(factory.panels.length, 2);
    });

    it('creates the panel with scripts disabled', () => {
      const factory = new FakeFactory();
      const card = new RiskCardPanel(factory);

      card.show(assessment(), fragment());

      assert.strictEqual(factory.options[0].enableScripts, false);
    });
  });
});
