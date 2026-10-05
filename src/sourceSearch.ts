import * as https from 'https';
import * as vscode from 'vscode';
import { CandidateSource } from './types';

export class SourceSearchEngine {
  /**
   * Searches for potential external sources using GitHub Search API or license detection algorithms
   */
  public static async searchSource(fingerprint: string, language: string): Promise<CandidateSource | undefined> {
    const config = vscode.workspace.getConfiguration('schemaAI');
    const token = config.get<string>('githubToken');

    // 1. Check for embedded license headers & copyright notices (e.g. GPL, MIT, Apache)
    const lowerText = fingerprint.toLowerCase();
    if (
      lowerText.includes('gnu general public license') ||
      lowerText.includes('gpl-3.0') ||
      lowerText.includes('gpl v3') ||
      lowerText.includes('licence gpl') ||
      lowerText.includes('free software foundation') ||
      lowerText.includes('without even the implied warranty of merchantability')
    ) {
      return {
        repository: 'External Open Source Project (GNU GPL-3.0 License)',
        url: 'https://www.gnu.org/licenses/gpl-3.0.html',
        license: 'GPL-3.0',
        similarity: 99
      };
    }

    if (lowerText.includes('mit license')) {
      return {
        repository: 'External Open Source (MIT Repository)',
        url: 'https://opensource.org/licenses/MIT',
        license: 'MIT',
        similarity: 95
      };
    }

    if (lowerText.includes('apache license')) {
      return {
        repository: 'External Open Source (Apache-2.0 Repository)',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
        license: 'Apache-2.0',
        similarity: 95
      };
    }

    // 2. Real GitHub Code Search Query (extract 2 distinct code identifiers/signatures)
    try {
      const keywords = fingerprint
        .replace(/[^a-zA-Z0-9_]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 5 && !['function', 'return', 'public', 'private', 'class', 'const', 'import', 'export', 'include'].includes(word))
        .slice(0, 3)
        .join(' ');

      if (!keywords || keywords.length < 5) {
        return undefined;
      }

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SchemAI-VSCode-Extension',
        'X-GitHub-Api-Version': '2022-11-28'
      };

      // 1. Try VS Code Native GitHub Authentication Session (Zero Setup for User)
      try {
        const session = await vscode.authentication.getSession('github', ['read:user'], { createIfNone: false });
        if (session) {
          headers['Authorization'] = `Bearer ${session.accessToken}`;
        } else if (token) {
          headers['Authorization'] = token.startsWith('github_pat_') || token.startsWith('ghp_') ? `Bearer ${token}` : `token ${token}`;
        }
      } catch {
        if (token) {
          headers['Authorization'] = token.startsWith('github_pat_') || token.startsWith('ghp_') ? `Bearer ${token}` : `token ${token}`;
        }
      }

      const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(keywords)}`;
      const searchResult = await new Promise<any>((resolve) => {
        const req = https.get(searchUrl, { headers, timeout: 4000 }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
      });

      if (searchResult && searchResult.items && searchResult.items.length > 0) {
        const item = searchResult.items[0];
        return {
          repository: item.repository?.full_name || 'GitHub External Project',
          url: item.html_url || 'https://github.com',
          license: 'GPL-3.0', // High risk default for found external match unless verified
          similarity: 88
        };
      }
    } catch (err) {
      console.warn('SchemAI: GitHub API search skipped or rate limited.', err);
    }

    return undefined;
  }
}
