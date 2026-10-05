import * as assert from 'assert';
import { CodeAnalyzer } from '../codeAnalyzer';

describe('CodeAnalyzer Unit Tests', () => {
  it('should identify valid code snippets', () => {
    const code = 'function calculateHash(data: string): string { return data; }';
    assert.strictEqual(CodeAnalyzer.isLikelyCode(code), true);
  });

  it('should reject short plain text', () => {
    const plainText = 'Hello world';
    assert.strictEqual(CodeAnalyzer.isLikelyCode(plainText), false);
  });

  it('should strip comments when generating fingerprints', () => {
    const code = '// Some comment\nconst x = 10; /* multiline */';
    const fingerprint = CodeAnalyzer.generateFingerprint(code);
    assert.strictEqual(fingerprint, 'const x = 10;');
  });
});
