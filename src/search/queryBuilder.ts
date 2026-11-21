export class QueryBuilder {
    /**
     * Builds a search query from the 3 most representative lines of a code snippet
     * (excluding braces, blank lines, and comments).
     */
    public static buildRepresentativeQuery(codeSnippet: string): string {
        const withoutComments = codeSnippet
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');

        const candidateLines = withoutComments
            .split(/\r?\n/)
            .map(line => line.replace(/[{}]/g, '').trim())
            .filter(line => line.length > 0);

        const representativeLines = candidateLines
            .sort((a, b) => b.length - a.length)
            .slice(0, 3);

        return representativeLines.join(' ');
    }
}