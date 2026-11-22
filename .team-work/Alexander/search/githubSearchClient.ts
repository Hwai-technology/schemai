import * as vscode from 'vscode';

export interface GitHubSearchCandidate {
  repository: string;
  url: string;
  filePath: string;
  similarity: number;
}

/**
 * Reference Code for Alexander (HU-07)
 * Extracted from prototype `sourceSearch.ts`.
 * Focuses strictly on GitHub Code Search query construction,
 * candidate retrieval, and authentic content verification.
 * (Network transport is delegated to Yunus; License extraction is delegated to David).
 */
export class GitHubSearchClient {
  public static buildQueryKeywords(codeTokens: string[]): string | undefined {
    // Require at least 4 distinct, substantial code identifiers (length >= 6)
    const uniqueIdentifiers = codeTokens.filter(t => t.length >= 6).slice(0, 5);
    if (uniqueIdentifiers.length < 4) {
      return undefined;
    }
    return uniqueIdentifiers.join(' ');
  }

  public static isSelfProject(repoFullName: string): boolean {
    const currentRepoName = vscode.workspace.name?.toLowerCase() || '';
    const lower = repoFullName.toLowerCase();
    return (
      lower.includes('schemai') ||
      lower.includes('hwai-technology') ||
      (currentRepoName.length > 3 && lower.includes(currentRepoName))
    );
  }

  public static buildSearchUrl(keywords: string): string {
    return `https://api.github.com/search/code?q=${encodeURIComponent(keywords)}`;
  }

  public static buildRawContentUrl(repoFullName: string, path: string): string {
    return `https://raw.githubusercontent.com/${repoFullName}/HEAD/${path}`;
  }
}

