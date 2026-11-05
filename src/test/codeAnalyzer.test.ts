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

  it('should generate a 64-character SHA-256 hash for fingerprint deduplication', () => {
    const fingerprint = 'const x = 10;';
    const hash = CodeAnalyzer.generateHash(fingerprint);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
    assert.strictEqual(hash, CodeAnalyzer.generateHash(fingerprint)); // deterministic
  });
});
