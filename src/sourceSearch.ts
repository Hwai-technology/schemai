import * as https from 'https';
import * as vscode from 'vscode';
import { CandidateSource } from './types';
import { AuthManager } from './auth/authManager';
import { SecretStorageManager } from './security/secretStorage';
import { CodeAnalyzer } from './codeAnalyzer';

export class SourceSearchEngine {
  private static warnedRateLimit = false;

  /**
   * Searches for potential external sources using GitHub Search API or license detection algorithms
   */
  public static async searchSource(
    fingerprint: string,
    language: string
  ): Promise<CandidateSource | undefined> {
    const lowerText = fingerprint.toLowerCase();

    // 1. Strict Check for authentic embedded full license copyright notices
    // Requires the authentic legal copyright header block, NOT casual strings, variables, or comments.
    const hasGplLegalNotice =
      lowerText.includes('gnu general public license') &&
      lowerText.includes('without even the implied warranty of merchantability') &&
      (lowerText.includes('free software foundation') || lowerText.includes('either version 3 of the license'));

    if (hasGplLegalNotice) {
      return {
        repository: 'GNU GPL-3.0 Licensed Code',
        url: 'https://www.gnu.org/licenses/gpl-3.0.html',
        license: 'GPL-3.0',
        similarity: 99,
        spdxId: 'GPL-3.0'
      };
    }

    const hasMitLegalNotice =
      lowerText.includes('permission is hereby granted, free of charge') &&
      lowerText.includes('substantial portions of the software') &&
      lowerText.includes('mit license');
    if (hasMitLegalNotice) {
      return {
        repository: 'External Open Source (MIT)',
        url: 'https://opensource.org/licenses/MIT',
        license: 'MIT',
        similarity: 95,
        spdxId: 'MIT'
      };
    }

    const hasApacheLegalNotice =
      lowerText.includes('apache license, version 2.0') &&
      lowerText.includes('you may not use this file except in compliance with the license');
    if (hasApacheLegalNotice) {
      return {
        repository: 'External Open Source (Apache-2.0)',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
        license: 'Apache-2.0',
        similarity: 95,
        spdxId: 'Apache-2.0'
      };
    }

    // 2. Real GitHub Code Search Query
    try {
      const codeTokens = Array.from(CodeAnalyzer.extractCodeTokens(fingerprint));

      // Require at least 4 distinct, substantial code identifiers to prevent searching common words
      const uniqueIdentifiers = codeTokens.filter(t => t.length >= 6).slice(0, 5);

      if (uniqueIdentifiers.length < 4) {
        return undefined; // Not enough distinct identifiers for reliable external matching
      }

      const keywords = uniqueIdentifiers.join(' ');

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'SchemAI-VSCode-Extension',
        'X-GitHub-Api-Version': '2022-11-28'
      };

      // Retrieve token from AuthManager or SecretStorage
      let token: string | undefined;
      try {
        token = await AuthManager.getInstance().getAccessToken();
      } catch {
        // AuthManager might not be initialized in isolated unit tests
      }

      if (!token) {
        try {
          token = await SecretStorageManager.getInstance().getGitHubPAT();
        } catch {
          // SecretStorage might not be initialized in isolated unit tests
        }
      }

      if (token) {
        headers['Authorization'] =
          token.startsWith('github_pat_') || token.startsWith('ghp_')
            ? `Bearer ${token}`
            : `token ${token}`;
      }

      const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(keywords)}`;
      const searchResponse = await this.httpGetJson(searchUrl, headers);

      // Handle Rate Limit (HU-10)
      if (searchResponse?.status === 403 || searchResponse?.status === 429) {
        this.notifyRateLimitError();
        return undefined;
      }

      const searchResult = searchResponse?.data;
      if (searchResult && searchResult.items && searchResult.items.length > 0) {
        const item = searchResult.items[0];
        const repoFullName = (item.repository?.full_name || '').toLowerCase();

        // 3. Self-Project Exclusion: Ignore if the match belongs to the project's own repository
        const currentRepoName = vscode.workspace.name?.toLowerCase() || '';
        if (
          repoFullName.includes('schemai') ||
          repoFullName.includes('hwai-technology') ||
          (currentRepoName.length > 3 && repoFullName.includes(currentRepoName))
        ) {
          return undefined; // Skip internal project repo
        }

        // 4. Strict Content Verification: Download candidate file to verify authentic similarity
        let authenticSimilarity = 0;
        if (item.repository?.full_name && item.path) {
          const rawUrl = `https://raw.githubusercontent.com/${item.repository.full_name}/HEAD/${item.path}`;
          const rawContent = await this.httpGetText(rawUrl, headers);
          if (rawContent) {
            authenticSimilarity = CodeAnalyzer.calculateTokenSimilarity(fingerprint, rawContent);
          }
        }

        // Only accept match if genuine similarity is >= 70% (prevent accidental variable name overlaps)
        if (authenticSimilarity < 0.70) {
          return undefined;
        }

        // Query repository metadata for actual license
        let actualLicense = 'UNKNOWN';
        let spdxId = 'UNKNOWN';

        if (repoFullName) {
          const repoUrl = `https://api.github.com/repos/${item.repository.full_name}`;
          const repoResponse = await this.httpGetJson(repoUrl, headers);
          if (repoResponse?.data?.license) {
            actualLicense =
              repoResponse.data.license.spdx_id ||
              repoResponse.data.license.name ||
              'UNKNOWN';
            spdxId = repoResponse.data.license.spdx_id || 'UNKNOWN';
          }
        }

        return {
          repository: item.repository?.full_name || 'GitHub External Project',
          url: item.html_url || `https://github.com/${item.repository?.full_name}`,
          license: actualLicense,
          similarity: Math.round(authenticSimilarity * 100),
          spdxId
        };
      }
    } catch (err) {
      console.warn('SchemAI: GitHub API search encountered an error.', err);
    }

    return undefined;
  }

  private static notifyRateLimitError(): void {
    if (this.warnedRateLimit) return;
    this.warnedRateLimit = true;

    vscode.window
      .showWarningMessage(
        'SchemAI: GitHub API rate limit reached. Sign in with your GitHub account to continue scanning without restrictions.',
        'Sign in to GitHub',
        'Dismiss'
      )
      .then(action => {
        if (action === 'Sign in to GitHub') {
          AuthManager.getInstance().login();
        }
      });

    setTimeout(() => {
      this.warnedRateLimit = false;
    }, 60000);
  }

  private static httpGetJson(
    url: string,
    headers: Record<string, string>
  ): Promise<{ status: number; data: any } | null> {
    return new Promise(resolve => {
      const req = https.get(url, { headers, timeout: 6000 }, res => {
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 200, data: parsed });
          } catch {
            resolve({ status: res.statusCode || 200, data: null });
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  private static httpGetText(
    url: string,
    headers: Record<string, string>
  ): Promise<string | null> {
    return new Promise(resolve => {
      const req = https.get(url, { headers, timeout: 6000 }, res => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => resolve(rawData));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }
}
