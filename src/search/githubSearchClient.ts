import { SourceMatch } from '../types';
import { QueryBuilder } from './queryBuilder';

export type HttpFetcher = (
    url: string,
    options?: { headers?: Record<string, string> }
) => Promise<any>;

export class GitHubSearchClient {
    constructor(
        private readonly token: string,
        private readonly fetcher?: HttpFetcher
    ) {}

    public static buildSearchUrl(query: string): string {
        return `https://api.github.com/search/code?q=${encodeURIComponent(query)}`;
    }

    public async searchCode(codeSnippet: string): Promise<SourceMatch[]> {
        const query = QueryBuilder.buildRepresentativeQuery(codeSnippet);
        if (!query || !this.fetcher) {
            return [];
        }

        const url = GitHubSearchClient.buildSearchUrl(query);
        const response = await this.fetcher(url, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${this.token}`
            }
        });

        const items = Array.isArray(response?.items) ? response.items : [];
        return items.map((item: any): SourceMatch => ({
            repository: item.repository?.full_name ?? item.full_name ?? item.name ?? '',
            url: item.html_url ?? item.repository?.html_url ?? '',
            path: item.path ?? item.name ?? '',
            similarity: typeof item.similarity === 'number' ? item.similarity : 0
        }));
    }
}