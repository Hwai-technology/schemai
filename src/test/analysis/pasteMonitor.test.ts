import 'mocha';
import * as assert from 'assert';
import { PasteMonitor } from '../../analysis/pasteMonitor';

describe('PasteMonitor (HU-05 T1)', () => {
  it('detects a paste when a change event inserts several lines equal to the clipboard text', async () => {
    const clipboardText = 'function add(a: number, b: number) {\n  return a + b;\n}\n';
    const detectedPastes: { text: string; languageId: string }[] = [];

    const monitor = new PasteMonitor(
      { readText: async () => clipboardText },
      (paste) => {
        detectedPastes.push(paste);
      }
    );

    await monitor.handleTextDocumentChange({
      document: {
        languageId: 'typescript',
        uri: { toString: () => 'file:///test.ts' }
      } as any,
      contentChanges: [
        {
          text: clipboardText,
          range: {} as any,
          rangeOffset: 0,
          rangeLength: 0
        }
      ],
      reason: undefined
    });

    assert.strictEqual(detectedPastes.length, 1);
    assert.strictEqual(detectedPastes[0].text, clipboardText);
    assert.strictEqual(detectedPastes[0].languageId, 'typescript');
  });

  it('ignores normal typing of a single character', async () => {
    const detectedPastes: unknown[] = [];

    const monitor = new PasteMonitor(
      { readText: async () => 'a' },
      (paste) => {
        detectedPastes.push(paste);
      }
    );

    await monitor.handleTextDocumentChange({
      document: {
        languageId: 'typescript',
        uri: { toString: () => 'file:///test.ts' }
      } as any,
      contentChanges: [
        {
          text: 'a',
          range: {} as any,
          rangeOffset: 0,
          rangeLength: 0
        }
      ],
      reason: undefined
    });

    assert.strictEqual(detectedPastes.length, 0);
  });

  it('ignores change events when the clipboard is empty', async () => {
    const detectedPastes: unknown[] = [];

    const monitor = new PasteMonitor(
      { readText: async () => '' },
      (paste) => {
        detectedPastes.push(paste);
      }
    );

    await monitor.handleTextDocumentChange({
      document: {
        languageId: 'typescript',
        uri: { toString: () => 'file:///test.ts' }
      } as any,
      contentChanges: [
        {
          text: 'const x = 1;\nconst y = 2;\n',
          range: {} as any,
          rangeOffset: 0,
          rangeLength: 0
        }
      ],
      reason: undefined
    });

    assert.strictEqual(detectedPastes.length, 0);
  });
});

