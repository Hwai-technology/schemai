import { SourceMatch } from '../types';

export interface SearchCandidateContent {
    readonly repository: string;
    readonly url: string;
    readonly path: string;
    readonly content: string;
}

export type CandidateSearchFetcher = (
    optimizedQuery: string
) => Promise<readonly SearchCandidateContent[]>;

export class SimilarityCalculator {
    public static tokenize(code: string): Set<string> {
        const withoutComments = code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');

        const matches = withoutComments.match(/[A-Za-z_][A-Za-z0-9_]{2,}/g) ?? [];
        return new Set<string>(matches);
    }

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
        return unionCount > 0 ? intersectionCount / unionCount : 0;
    }

    public static calculateSimilarity(fragmentA: string, fragmentB: string): number {
        return this.calculate(this.tokenize(fragmentA), this.tokenize(fragmentB));
    }

    public static buildOptimizedQuery(fragment: string): string {
        const tokens = Array.from(this.tokenize(fragment));
        const substantialTokens = tokens
            .filter(token => token.length >= 6)
            .sort((a, b) => b.length - a.length)
            .slice(0, 5);

        return substantialTokens.join(' ');
    }

    public static sortBySimilarity(matches: readonly SourceMatch[]): SourceMatch[] {
        return [...matches].sort((a, b) => b.similarity - a.similarity);
    }

    public static async searchAndSortBySimilarity(
        fragment: string,
        fetcher: CandidateSearchFetcher
    ): Promise<SourceMatch[]> {
        const optimizedQuery = this.buildOptimizedQuery(fragment);
        if (!optimizedQuery) {
            return [];
        }

        const snippetTokens = this.tokenize(fragment);
        const candidates = await fetcher(optimizedQuery);

        const scoredMatches: SourceMatch[] = candidates.map(candidate => ({
            repository: candidate.repository,
            url: candidate.url,
            path: candidate.path,
            similarity: this.calculate(snippetTokens, this.tokenize(candidate.content))
        }));

        return this.sortBySimilarity(scoredMatches);
    }
}
