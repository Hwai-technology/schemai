import { SourceMatch } from '../types';

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

    public async searchCode(_codeSnippet: string): Promise<SourceMatch[]> {
        // Stub for TDD RED phase
        return [];
    }
}