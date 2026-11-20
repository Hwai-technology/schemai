import 'mocha';
import * as assert from 'assert';
import { performance } from 'perf_hooks';
import { AnalysisQueue, QueuedAnalysisItem } from '../../analysis/analysisQueue';
import { CodeAnalyzer } from '../../analysis/codeAnalyzer';
import { ConfigManager } from '../../config/configManager';
import { LicenseDetector } from '../../licenses/licenseDetector';
import { RiskEngine } from '../../licenses/riskEngine';
import { LLMClient } from '../../llm/llmClient';
import { SimilarityCalculator } from '../../search/similarity';
import { MockGitHubSearchService } from '../mocks/githubSearch.mock';
import { MockLLMService } from '../mocks/llm.mock';

/**
 * QA T3: a complete analysis of a realistic 30-line fragment must finish in
 * 15 seconds or less when every external API is replaced by a mock.
 *
 * The fixture is intentionally built from 30 separate lines so the test also
 * proves that the analysed fragment really has the size required by the task.
 */
const FRAGMENT_LINES: readonly string[] = [
  '/**',
  'MIT License',
  'Permission is hereby granted, free of charge, to any person obtaining a copy',
  'of this software and associated documentation files, to deal in the Software',
  'without restriction, including without limitation the rights to use, copy,',
  'modify, merge, publish, distribute, sublicense, and/or sell copies of the',
  'Software, and to permit persons to whom the Software is furnished to do so,',
  'subject to the following conditions: the above copyright notice and this',
  'permission notice shall be included in all copies or substantial portions',
  'of the Software.',
  ' */',
  "import { EventEmitter } from 'events';",
  'export interface PipelineOptions {',
  '  readonly concurrency: number;',
  '}',
  '',
  'export class TelemetryPipeline {',
  '  private readonly emitter = new EventEmitter();',
  '',
  '  public constructor(private readonly options: PipelineOptions) {}',
  '',
  '  public async process(samples: readonly string[]): Promise<number> {',
  '    let processed = 0;',
  '    for (const sample of samples) {',
  "      this.emitter.emit('sample', sample);",
  '      processed += sample.length;',
  '    }',
  '    return processed;',
  '  }',
  '}'
];

const FAKE_LLM_KEY = 'test-llm-key-for-benchmark';

/** The settings the analysis pipeline reads; small enough to fake inline. */
const CONFIGURATION = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    switch (key) {
      case 'projectLicense':
        return 'MIT' as unknown as T;
      case 'allowedLicenses':
        return ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'] as unknown as T;
      case 'restrictedLicenses':
        return ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'SSPL'] as unknown as T;
      default:
        return defaultValue;
    }
  }
};

interface BenchmarkResult {
  readonly isCode: boolean;
  readonly fingerprint: string;
  readonly hash: string;
  readonly searchCalls: number;
  readonly matchCount: number;
  readonly bestSimilarity: number;
  readonly detectedLicense: string;
  readonly riskLevel: string;
  readonly explanation: string;
}

/**
 * Runs one end-to-end analysis using only mocked collaborators:
 * GitHub Search -> candidate similarity -> embedded license -> risk -> LLM.
 */
async function analyzeFragment(fragment: string): Promise<BenchmarkResult> {
  const search = new MockGitHubSearchService();
  const llm = new MockLLMService();
  let searchCalls = 0;

  const query = SimilarityCalculator.buildOptimizedQuery(fragment);
  const searchResponse = await search.searchRepositories(query);
  searchCalls++;

  const candidates = searchResponse.items.map((item, index) => ({
    repository: item.full_name,
    url: `${item.html_url}/blob/main/src/pipeline.ts`,
    path: 'src/pipeline.ts',
    // One exact copy (similarity 1.0) and one partial copy to exercise sorting.
    content: index === 0 ? fragment : FRAGMENT_LINES.slice(0, 15).join('\n')
  }));

  const matches = await SimilarityCalculator.searchAndSortBySimilarity(
    fragment,
    async () => candidates
  );
  const bestMatch = matches[0];
  assert.ok(bestMatch, 'the mocked search must return at least one match');

  const bestCandidate = candidates.find(
    (candidate) => candidate.repository === bestMatch.repository
  );
  assert.ok(bestCandidate, 'the best match must have candidate content');

  const embedded = LicenseDetector.detectEmbeddedNotice(bestCandidate.content);
  const detectedLicense = embedded?.spdxId ??
    LicenseDetector.parseRepoMetadataLicense({ license: { spdx_id: 'NONE' } }).spdxId;

  const policy = ConfigManager.getPolicy(CONFIGURATION);
  const risk = RiskEngine.evaluateRisk(
    {
      repository: bestMatch.repository,
      url: bestMatch.url,
      license: detectedLicense,
      similarity: bestMatch.similarity
    },
    policy
  );

  const llmClient = new LLMClient(
    {
      post: async (request) => {
        const completion = await llm.generateCompletion(request.body);
        return { text: completion.choices[0].message.content };
      }
    },
    { getLlmApiKey: async () => FAKE_LLM_KEY },
    5_000
  );
  const explanation = await llmClient.explain(fragment, {
    detectedLicense,
    projectLicense: policy.projectLicense,
    riskLevel: risk.riskLevel
  });

  return {
    isCode: CodeAnalyzer.isLikelyCode(fragment),
    fingerprint: CodeAnalyzer.generateFingerprint(fragment),
    hash: CodeAnalyzer.generateHash(CodeAnalyzer.generateFingerprint(fragment)),
    searchCalls,
    matchCount: matches.length,
    bestSimilarity: bestMatch.similarity,
    detectedLicense,
    riskLevel: risk.riskLevel,
    explanation
  };
}

/** Sends the fragment through the real non-blocking AnalysisQueue. */
function runAnalysis(fragment: string): Promise<{ result: BenchmarkResult; elapsedMs: number }> {
  return new Promise((resolve, reject) => {
    const queue = new AnalysisQueue({
      worker: (item: QueuedAnalysisItem) => analyzeFragment(item.text)
    });
    const start = performance.now();
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      queue.dispose();
      reject(new Error('The analysis exceeded the 15000 ms performance budget'));
    }, 15_000);

    const subscription = queue.onAnalysisComplete(({ result }) => {
      if (settled) {
        return;
      }
      settled = true;
      const elapsedMs = performance.now() - start;
      clearTimeout(timer);
      subscription.dispose();
      queue.dispose();
      resolve({ result: result as BenchmarkResult, elapsedMs });
    });

    const fingerprint = CodeAnalyzer.generateFingerprint(fragment);
    const item: QueuedAnalysisItem = {
      id: 'qa-t3-benchmark',
      text: fragment,
      fingerprint,
      fingerprintHash: CodeAnalyzer.generateHash(fingerprint),
      languageId: 'typescript'
    };
    queue.enqueue(item, true);
  });
}

describe('QA T3: performance benchmark', function () {
  this.timeout(20_000);

  it('analyses a 30-line fragment with mocked APIs in 15 s or less', async () => {
    assert.strictEqual(FRAGMENT_LINES.length, 30, 'the fixture must have exactly 30 lines');

    const fragment = FRAGMENT_LINES.join('\n');
    const { result, elapsedMs } = await runAnalysis(fragment);

    assert.ok(
      elapsedMs <= 15_000,
      `analysis took ${elapsedMs.toFixed(1)} ms, budget is 15000 ms`
    );

    assert.strictEqual(result.isCode, true, 'the fixture must be recognised as source code');
    assert.ok(result.fingerprint.length > 0, 'the fingerprint must not be empty');
    assert.match(result.hash, /^[a-f0-9]{64}$/, 'the fingerprint hash must be a SHA-256 digest');
    assert.strictEqual(result.searchCalls, 1, 'the mocked GitHub API must be called once');
    assert.strictEqual(result.matchCount, 2, 'both mocked candidates must be scored');
    assert.strictEqual(result.bestSimilarity, 1, 'the identical candidate must rank first');
    assert.strictEqual(result.detectedLicense, 'MIT');
    assert.strictEqual(result.riskLevel, 'low', 'MIT in an MIT project is low risk');
    assert.ok(
      result.explanation.includes('Mock response'),
      'the mocked LLM response must reach the analysis result'
    );
  });
});
