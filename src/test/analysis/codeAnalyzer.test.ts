import 'mocha';
import * as assert from 'assert';
import { CodeAnalyzer } from '../../analysis/codeAnalyzer';

describe('CodeAnalyzer (HU-05 T3)', () => {
  describe('isLikelyCode', () => {
    it('rejects a plain natural language sentence like "Please return the form (signed) by Friday"', () => {
      const sentence = 'Please return the form (signed) by Friday';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(sentence), false);
    });

    it('rejects general conversational or prose text with common English words and punctuation', () => {
      const prose =
        'If you have any questions, please let me know while you are in the office.\n' +
        'We can discuss the terms and conditions during our weekly meeting.\n' +
        'Thank you very much for your cooperation and support.';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(prose), false);
    });

    it('ignores fragments below the minimum size (fewer than 3 lines by default)', () => {
      // 1 line code snippet
      assert.strictEqual(CodeAnalyzer.isLikelyCode('const x = 1;'), false);
      // 2 lines code snippet
      assert.strictEqual(CodeAnalyzer.isLikelyCode('const x = 1;\nconsole.log(x);'), false);
      // empty or whitespace
      assert.strictEqual(CodeAnalyzer.isLikelyCode('   \n  \n  '), false);
      assert.strictEqual(CodeAnalyzer.isLikelyCode(''), false);
    });

    it('accepts a 3-line function as valid code', () => {
      const functionCode =
        'function add(a: number, b: number): number {\n' +
        '  return a + b;\n' +
        '}';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(functionCode), true);
    });

    it('accepts multi-line code snippets in different programming languages', () => {
      const pythonCode =
        'def calculate_total(items):\n' +
        '    total = 0\n' +
        '    for item in items:\n' +
        '        total += item.price\n' +
        '    return total';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(pythonCode), true);

      const tsClass =
        'export class Calculator {\n' +
        '  public multiply(x: number, y: number): number {\n' +
        '    return x * y;\n' +
        '  }\n' +
        '}';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(tsClass), true);
    });

    it('respects a custom minLines parameter or options object', () => {
      const twoLineCode = 'const x = 1;\nreturn x + 2;';
      assert.strictEqual(CodeAnalyzer.isLikelyCode(twoLineCode, 2), true);
      assert.strictEqual(CodeAnalyzer.isLikelyCode(twoLineCode, 3), false);
    });
  });

  describe('generateFingerprint', () => {
    it('preserves license header block comments containing license/copyright notices', () => {
      const snippetWithLicense =
        '/*\n' +
        ' * Copyright (c) 2026 Example Corp.\n' +
        ' * SPDX-License-Identifier: MIT\n' +
        ' */\n' +
        'function calculate(x: number) {\n' +
        '  // inline calculation comment to remove\n' +
        '  return x * 2;\n' +
        '}';

      const fingerprint = CodeAnalyzer.generateFingerprint(snippetWithLicense);

      assert.ok(
        fingerprint.includes('SPDX-License-Identifier: MIT') ||
        fingerprint.includes('Copyright (c) 2026 Example Corp.'),
        'License header comment should be preserved in fingerprint'
      );
      assert.strictEqual(
        fingerprint.includes('inline calculation comment'),
        false,
        'Non-license inline comments must be removed'
      );
    });

    it('preserves contiguous line comments that form a license header', () => {
      const snippetWithGpl =
        '// Copyright (C) 2026 Free Software Foundation\n' +
        '// This program is free software under GNU General Public License\n' +
        '// without even the implied warranty of merchantability\n' +
        'function initApp() {\n' +
        '  const app = new App();\n' +
        '  return app;\n' +
        '}';

      const fingerprint = CodeAnalyzer.generateFingerprint(snippetWithGpl);

      assert.ok(
        fingerprint.includes('GNU General Public License') &&
        fingerprint.includes('Free Software Foundation'),
        'Line-comment license header must be preserved'
      );
    });

    it('strips non-license comments (both inline and block comments)', () => {
      const snippet =
        '/* A temporary helper function */\n' +
        'function sum(a, b) {\n' +
        '  // add numbers together\n' +
        '  return a + b; // end of function\n' +
        '}';

      const fingerprint = CodeAnalyzer.generateFingerprint(snippet);

      assert.strictEqual(fingerprint.includes('A temporary helper function'), false);
      assert.strictEqual(fingerprint.includes('add numbers together'), false);
      assert.strictEqual(fingerprint.includes('end of function'), false);
      assert.strictEqual(fingerprint, 'function sum(a, b) { return a + b; }');
    });

    it('normalizes redundant whitespace and trims edges', () => {
      const snippet = '   const   a   =   1;  \n\n\n  const   b   =   2;   ';
      const fingerprint = CodeAnalyzer.generateFingerprint(snippet);
      assert.strictEqual(fingerprint, 'const a = 1; const b = 2;');
    });
  });

  describe('utility methods (generateHash, extractCodeTokens, calculateTokenSimilarity)', () => {
    it('generates a deterministic sha256 hash for identical fingerprints', () => {
      const fp1 = 'function test() { return true; }';
      const fp2 = 'function test() { return true; }';
      const hash1 = CodeAnalyzer.generateHash(fp1);
      const hash2 = CodeAnalyzer.generateHash(fp2);

      assert.strictEqual(typeof hash1, 'string');
      assert.strictEqual(hash1.length, 64);
      assert.strictEqual(hash1, hash2);
    });

    it('extracts non-keyword code tokens with length >= 3', () => {
      const code = 'function calculateTotalPrice(itemList) { return itemList; }';
      const tokens = CodeAnalyzer.extractCodeTokens(code);

      assert.ok(tokens.has('calculateTotalPrice'));
      assert.ok(tokens.has('itemList'));
      assert.strictEqual(tokens.has('function'), false);
      assert.strictEqual(tokens.has('return'), false);
    });

    it('calculates token similarity between snippet and source correctly', () => {
      const snippet = 'function calculateTotal(items) { return items; }';
      const identical = 'function calculateTotal(items) { return items; }';
      const completelyDifferent = 'class Person { name: string; age: number; }';

      const similarity1 = CodeAnalyzer.calculateTokenSimilarity(snippet, identical);
      assert.strictEqual(similarity1, 1);

      const similarity2 = CodeAnalyzer.calculateTokenSimilarity(snippet, completelyDifferent);
      assert.strictEqual(similarity2, 0);
    });
  });
});
