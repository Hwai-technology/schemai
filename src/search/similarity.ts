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
    public static tokenize(_code: string): Set<string> {
        return new Set<string>();
    }

    public static calculate(_tokensSnippet: Set<string>, _tokensSource: Set<string>): number {
        return 0;
    }

    public static calculateSimilarity(_fragmentA: string, _fragmentB: string): number {
        return -1;
    }

    public static buildOptimizedQuery(_fragment: string): string {
        return '';
    }

    public static sortBySimilarity(_matches: readonly SourceMatch[]): SourceMatch[] {
        return [];
    }

    public static async searchAndSortBySimilarity(
        _fragment: string,
        _fetcher: CandidateSearchFetcher
    ): Promise<SourceMatch[]> {
        return [];
    }
}
