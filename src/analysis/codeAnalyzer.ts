import * as crypto from 'crypto';

/**
 * Options to configure snippet code analysis.
 */
export interface CodeAnalyzerOptions {
  /**
   * Minimum non-empty lines required to consider snippet as code.
   * Defaults to 3 (matching schemaAI.minFragmentLines).
   */
  minLines?: number;

  /**
   * Minimum character length required for code snippet.
   * Defaults to 15.
   */
  minLength?: number;
}

/**
 * Keywords and patterns commonly indicating license and copyright notices.
 */
const LICENSE_INDICATOR_PATTERN =
  /\b(copyright|\(c\)|©|license|licensed|spdx-license-identifier|all rights reserved|general public license|gpl|apache|mit|bsd|mozilla|mpl|unlicense|warranty of merchantability|free software foundation|permission is hereby granted)\b/i;

/**
 * Common language keywords filtered out when extracting signature code tokens.
 */
const COMMON_KEYWORDS = new Set([
  'function', 'return', 'public', 'private', 'class', 'const', 'let', 'var',
  'import', 'export', 'include', 'void', 'static', 'if', 'else', 'auto',
  'while', 'for', 'switch', 'case', 'break', 'true', 'false', 'null',
  'string', 'number', 'boolean', 'int', 'def', 'self', 'this'
]);

/**
 * Analyzes code snippets to detect programming language structures,
 * generate deterministic deduplication fingerprints while preserving license notices,
 * and calculate token similarities.
 */
export class CodeAnalyzer {
  public static readonly DEFAULT_MIN_LINES = 3;
  public static readonly DEFAULT_MIN_LENGTH = 15;

  /**
   * Checks whether the given text is likely to be source code rather than
   * plain natural language or trivial fragments below the minimum size.
   */
  public static isLikelyCode(
    text: string,
    minLinesOrOptions: number | CodeAnalyzerOptions = CodeAnalyzer.DEFAULT_MIN_LINES
  ): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const trimmed = text.trim();
    const minLines =
      typeof minLinesOrOptions === 'number'
        ? minLinesOrOptions
        : (minLinesOrOptions?.minLines ?? CodeAnalyzer.DEFAULT_MIN_LINES);
    const minLength =
      typeof minLinesOrOptions === 'object' && minLinesOrOptions?.minLength !== undefined
        ? minLinesOrOptions.minLength
        : CodeAnalyzer.DEFAULT_MIN_LENGTH;

    if (trimmed.length < minLength) {
      return false;
    }

    const nonBlankLines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (nonBlankLines.length < minLines) {
      return false;
    }

    // Measure presence of structural code constructs vs plain text
    let codeScore = 0;

    // 1. Structural definitions and declarations (+3 each)
    if (/(?:^|\s)(?:function|def|fn|func|sub)\s+[a-zA-Z_$][\w$]*\s*\(/m.test(trimmed)) {
      codeScore += 3;
    }
    if (/(?:^|\s)(?:class|interface|struct|enum|trait|type)\s+[a-zA-Z_$][\w$]*/m.test(trimmed)) {
      codeScore += 3;
    }
    if (/(?:^|\s)(?:const|let|var|val)\s+[a-zA-Z_$][\w$]*\s*[:=]/m.test(trimmed)) {
      codeScore += 3;
    }
    if (/(?:^|\s)(?:import|export)\s+(?:\{|\*|[a-zA-Z_$]|default)/m.test(trimmed)) {
      codeScore += 3;
    }

    // 2. Block delimiters and statement terminators
    if (/[{}]/.test(trimmed)) {
      codeScore += 2;
    }
    if (/;\s*$/m.test(trimmed)) {
      codeScore += 2;
    }

    // 3. Operators and arrows
    if (/=>|->|===|!==|==|!=|\+\+|--|\+=|-=|\*=|\/=|&&|\|\|/.test(trimmed)) {
      codeScore += 2;
    }

    // 4. Return statements, control structures, and loops
    if (/\breturn(?:\s+[^;]+)?\s*(?:;|$)/m.test(trimmed)) {
      codeScore += 2;
    }
    if (/\b(if|for|while|switch|catch)\s*\([^)]*\)\s*\{?/m.test(trimmed) || /\bfor\s+\w+\s+in\s+\w+\s*:/m.test(trimmed)) {
      codeScore += 2;
    }

    // 5. TypeScript / typed parameters or returns
    if (/\w+\s*:\s*(?:string|number|boolean|void|any|unknown|object|int|float)\b/m.test(trimmed)) {
      codeScore += 2;
    }

    // Natural language prose penalties (sentences ending with . ! ? followed by space and capital letter, with no code markers)
    const proseSentenceMatches = trimmed.match(/[.!?]\s+[A-Z]/g);
    if (proseSentenceMatches && proseSentenceMatches.length >= 2 && !/[{};=]/.test(trimmed)) {
      codeScore -= 3;
    }

    return codeScore >= 3;
  }

  /**
   * Generates a normalized fingerprint for the snippet.
   * Strips non-license comments, but explicitly preserves license and copyright headers.
   */
  public static generateFingerprint(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let processed = text;

    // 1. Process block comments: keep if they contain license notices, remove otherwise
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, (blockComment) => {
      if (LICENSE_INDICATOR_PATTERN.test(blockComment)) {
        return blockComment;
      }
      return ' ';
    });

    // 2. Process contiguous line comment blocks: keep if block contains license notice
    processed = processed.replace(/(?:^[ \t]*\/\/[^\r\n]*(?:\r?\n|$))+/gm, (lineCommentBlock) => {
      if (LICENSE_INDICATOR_PATTERN.test(lineCommentBlock)) {
        return lineCommentBlock;
      }
      return ' ';
    });

    // 3. Process remaining inline comments
    processed = processed.replace(/\/\/[^\r\n]*/g, (lineComment) => {
      if (LICENSE_INDICATOR_PATTERN.test(lineComment)) {
        return lineComment;
      }
      return ' ';
    });

    // 4. Normalize redundant whitespace and trim
    return processed.replace(/\s+/g, ' ').trim();
  }

  /**
   * Computes a deterministic SHA-256 hash of the given fingerprint string.
   */
  public static generateHash(fingerprint: string): string {
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex');
  }

  /**
   * Extracts meaningful code tokens, ignoring common programming keywords and short identifiers.
   */
  public static extractCodeTokens(text: string): Set<string> {
    const words = text
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !COMMON_KEYWORDS.has(w.toLowerCase()));

    return new Set(words);
  }

  /**
   * Calculates the Jaccard token similarity (0 to 1) between two snippets.
   */
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
    return unionCount > 0 ? intersectionCount / unionCount : 0;
  }
}
