export class CodeAnalyzer {
  /**
   * Determines if the given text is likely source code (heuristics)
   */
  public static isLikelyCode(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 15) {
      return false; // ignore tiny strings/words
    }

    // Check code indicators (keywords, brackets, semicolons, function syntax)
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

  /**
   * Generates a normalized fingerprint of the code (stripping whitespace, comments, etc.)
   */
  public static generateFingerprint(text: string): string {
    const normalized = text
      .replace(/\s+/g, ' ')                  // collapse whitespace
      .trim();

    return normalized;
  }
}
