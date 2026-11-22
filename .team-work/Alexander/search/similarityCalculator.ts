/**
 * Reference Code for Alexander (HU-07)
 * Helper functions for snippet tokenization and similarity calculation.
 */
export class SimilarityCalculator {
  public static calculate(tokensSnippet: Set<string>, tokensSource: Set<string>): number {
    if (tokensSnippet.size === 0 || tokensSource.size === 0) {
      return 0;
    }

    let intersectionCount = 0;
    for (const token of tokensSnippet) {
      if (tokensSource.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = new Set([...tokensSnippet, ...tokensSource]).size;
    return unionCount > 0 ? (intersectionCount / unionCount) : 0;
  }
}

