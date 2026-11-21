import * as assert from 'assert';
import { GitHubSearchClient } from '../../search/githubSearchClient';
import { mockGitHubSearchResults } from '../mocks/githubSearch.mock'; // Adjust path to where Yunus put githubSearch.mock.ts
import { SourceMatch } from '../../types';

describe('HU-07 T2: GitHubSearchClient Code Search & Mapping', () => {
    it('calls the /search/code endpoint with the Authorization header and returns SourceMatch[]', async () => {
        let capturedUrl = '';
        let capturedHeaders: Record<string, string> | undefined;

        // Wrap Yunus's mock data in a mock fetcher that inspects the endpoint and headers
        const mockFetcher = async (url: string, options?: { headers?: Record<string, string> }) => {
            capturedUrl = url;
            capturedHeaders = options?.headers;
            return mockGitHubSearchResults;
        };

        const client = new GitHubSearchClient('ghp_testSecretToken123', mockFetcher);
        const snippet = `
            // Comment line
            {
                const alphaServiceInstance = createAlphaService(configuration);
                const betaRepositoryClient = createBetaRepositoryClient(alphaServiceInstance);
                const gammaExecutionResult = await betaRepositoryClient.executeSearchQuery();
            }
        `;

        const results: SourceMatch[] = await client.searchCode(snippet);

        // 1. Verify it hits the code search endpoint (/search/code)
        assert.ok(
            capturedUrl.startsWith('https://api.github.com/search/code?q='),
            `Expected code search URL, got: ${capturedUrl}`
        );

        // 2. Verify it sends the Authorization header
        assert.ok(capturedHeaders, 'Headers must be provided');
        assert.strictEqual(
            capturedHeaders?.['Authorization'],
            'Bearer ghp_testSecretToken123',
            'Must include Bearer Authorization header'
        );

        // 3. Verify it returns SourceMatch[] mapped from Yunus's mock items
        assert.strictEqual(results.length, 2, 'Should return 2 SourceMatch items from mock');
        assert.strictEqual(results[0].repository, 'test-user/schema-demo');
        assert.strictEqual(results[0].url, 'https://github.com/test-user/schema-demo');
    });
});