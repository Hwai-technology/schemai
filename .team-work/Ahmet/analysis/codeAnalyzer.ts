import * as crypto from 'crypto';

/**
 * Reference Code for Ahmet (HU-05)
 * Extracts meaningful code tokens, validates if snippet is source code,
 * and generates deterministic hash for deduplication.
 */
export class CodeAnalyzer {
  public static isLikelyCode(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 15) {
      return false;
    }

    const codeIndicators = [
      /\b(const|let|var|function|class|import|export|return|if|for|while|async|await|public|private|def|struct|fn)\b/,
      /[{}();=<>]/,
      /=>/
    ];

    let matchCount = 0;
    for (const pattern of codeIndicators) {
      if (pattern.test(trimmed)) {
        matchCount++;
      }
    }

    return matchCount >= 2;
  }

  public static generateFingerprint(text: string): string {
    const withoutComments = text
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    return withoutComments
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static generateHash(fingerprint: string): string {
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex');
  }

  public static extractCodeTokens(text: string): Set<string> {
    const commonKeywords = new Set([
      'function', 'return', 'public', 'private', 'class', 'const', 'let', 'var',
      'import', 'export', 'include', 'void', 'static', 'if', 'else', 'auto',
      'while', 'for', 'switch', 'case', 'break', 'true', 'false', 'null',
      'string', 'number', 'boolean', 'int', 'def', 'self', 'this'
    ]);

    const words = text
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !commonKeywords.has(w.toLowerCase()));

    return new Set(words);
  }

  public static calculateTokenSimilarity(snippet: string, source: string): number {
    const tokensA = this.extractCodeTokens(snippet);
    const tokensB = this.extractCodeTokens(source);

    if (tokensA.size === 0 || tokensB.size === 0) {
      return 0;
    }

    let intersectionCount = 0;
    for (const token of tokensA) {
      if (tokensB.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    return unionCount > 0 ? (intersectionCount / unionCount) : 0;
  }
}
