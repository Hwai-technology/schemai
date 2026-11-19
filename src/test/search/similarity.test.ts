import 'mocha';
import * as assert from 'assert';
import { SimilarityCalculator } from '../../search/similarity';
import { SourceMatch } from '../../types';

describe('HU-07 T3: Similarity Calculation, Query Optimisation & Sorting', () => {
    it('gives similarity 1.0 for two identical fragments and close to 0 for unrelated ones', () => {
        const fragmentA = `
            export function computeRollingChecksum(payloadBuffer: Uint8Array, windowSize: number): number {
                let accumulator = 0;
                for (let index = 0; index < payloadBuffer.length; index++) {
                    accumulator = (accumulator * 31 + payloadBuffer[index]) % 65535;
                }
                return accumulator ^ windowSize;
            }
        `;

        const unrelatedFragment = `
            export class DatabaseConnectionPool {
                private readonly activeSockets = new Map<string, SocketHandle>();
                public async releaseAllHandles(): Promise<void> {
                    this.activeSockets.clear();
                }
            }
        `;

        const identicalScore = SimilarityCalculator.calculateSimilarity(fragmentA, fragmentA);
        const unrelatedScore = SimilarityCalculator.calculateSimilarity(fragmentA, unrelatedFragment);

        assert.strictEqual(identicalScore, 1.0, 'Identical fragments must have similarity 1.0');
        assert.ok(
            unrelatedScore >= 0 && unrelatedScore < 0.15,
            `Unrelated fragments should have similarity close to 0, got: ${unrelatedScore}`
        );
    });

    it('sorts results from highest to lowest similarity without mutating the input array', () => {
        const unsortedMatches: SourceMatch[] = [
            {
                repository: 'org/low-match',
                url: 'https://github.com/org/low-match/blob/main/src/util.ts',
                path: 'src/util.ts',
                similarity: 0.21
            },
            {
                repository: 'org/high-match',
                url: 'https://github.com/org/high-match/blob/main/src/core.ts',
                path: 'src/core.ts',
                similarity: 0.94
            },
            {
                repository: 'org/medium-match',
                url: 'https://github.com/org/medium-match/blob/main/src/helper.ts',
                path: 'src/helper.ts',
                similarity: 0.63
            }
        ];

        const sorted = SimilarityCalculator.sortBySimilarity(unsortedMatches);

        assert.strictEqual(sorted.length, 3);
        assert.deepStrictEqual(
            sorted.map(m => m.repository),
            ['org/high-match', 'org/medium-match', 'org/low-match']
        );
        assert.deepStrictEqual(
            sorted.map(m => m.similarity),
            [0.94, 0.63, 0.21]
        );
        // Original array must remain in its original order
        assert.strictEqual(unsortedMatches[0].repository, 'org/low-match');
    });

    it('finishes a full search of a 30-line fragment with mocked latency in 15 s or less', async () => {
        const thirtyLineLines: string[] = [];
        for (let i = 1; i <= 30; i++) {
            thirtyLineLines.push(
                `const pipelineStageProcessor${i} = initializeTelemetryStageProcessor(configSection${i}, metricCollector${i});`
            );
        }
        const thirtyLineFragment = thirtyLineLines.join('\n');

        let fetchCallCount = 0;
        let receivedQuery = '';

        const mockedLatencyFetcher = async (optimizedQuery: string) => {
            fetchCallCount++;
            receivedQuery = optimizedQuery;
            // Simulate realistic network round-trip latency
            await new Promise(resolve => setTimeout(resolve, 40));
            return [
                {
                    repository: 'vendor/unrelated-lib',
                    url: 'https://github.com/vendor/unrelated-lib/blob/main/index.ts',
                    path: 'index.ts',
                    content: 'export const unrelatedConstantValue = "hello world";'
                },
                {
                    repository: 'vendor/telemetry-engine',
                    url: 'https://github.com/vendor/telemetry-engine/blob/main/pipeline.ts',
                    path: 'pipeline.ts',
                    content: thirtyLineFragment
                },
                {
                    repository: 'vendor/partial-telemetry',
                    url: 'https://github.com/vendor/partial-telemetry/blob/main/partial.ts',
                    path: 'partial.ts',
                    content: thirtyLineLines.slice(0, 15).join('\n')
                }
            ];
        };

        const startTime = Date.now();
        const results = await SimilarityCalculator.searchAndSortBySimilarity(
            thirtyLineFragment,
            mockedLatencyFetcher
        );
        const elapsedMs = Date.now() - startTime;

        assert.ok(elapsedMs <= 15000, `Expected search to finish in <= 15000ms, took ${elapsedMs}ms`);
        assert.strictEqual(fetchCallCount, 1, 'Must issue a single optimised search query rather than per-line queries');
        assert.ok(receivedQuery.length > 0, 'Optimised query must not be empty');
        assert.strictEqual(results.length, 3, 'Must return all 3 evaluated candidates');
        assert.strictEqual(results[0].repository, 'vendor/telemetry-engine');
        assert.strictEqual(results[0].similarity, 1.0);
        assert.strictEqual(results[1].repository, 'vendor/partial-telemetry');
        assert.ok(results[0].similarity > results[1].similarity);
        assert.ok(results[1].similarity > results[2].similarity);
    });
});
