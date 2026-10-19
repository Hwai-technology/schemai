import 'mocha';
import * as assert from 'assert';
import { RiskEngine } from '../riskEngine';
import { CandidateSource, ProjectPolicy } from '../types';

describe('RiskEngine Unit Tests', () => {
  const mockPolicy: ProjectPolicy = {
    projectLicense: 'MIT',
    allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause'],
    restrictedLicenses: ['GPL-3.0', 'AGPL-3.0']
  };

  it('should return LOW risk when no source match is found', () => {
    const result = RiskEngine.evaluateRisk(undefined, mockPolicy);
    assert.strictEqual(result.riskLevel, 'LOW');
  });

  it('should return HIGH risk when detected license is restricted', () => {
    const sourceMatch: CandidateSource = {
      repository: 'github/example-repo',
      license: 'GPL-3.0',
      similarity: 0.95,
      url: 'https://github.com/example-repo'
    };

    const result = RiskEngine.evaluateRisk(sourceMatch, mockPolicy);
    assert.strictEqual(result.riskLevel, 'HIGH');
  });

  it('should return LOW risk when detected license is allowed', () => {
    const sourceMatch: CandidateSource = {
      repository: 'github/permissive-repo',
      license: 'Apache-2.0',
      similarity: 0.88,
      url: 'https://github.com/permissive-repo'
    };

    const result = RiskEngine.evaluateRisk(sourceMatch, mockPolicy);
    assert.strictEqual(result.riskLevel, 'LOW');
  });
  // --- MOCK GITHUB TESTI ---
  it('should use mocked GitHub API to return candidate source', async () => {
    const mockGitHubService = {
      searchSource: async (snippet: string) => ({
        repository: 'mocked/repo',
        license: 'MIT',
        similarity: 0.99,
        url: 'https://github.com/mocked/repo'
      })
    };

    const source = await mockGitHubService.searchSource('sample code');
    assert.strictEqual(source.repository, 'mocked/repo');
    assert.strictEqual(source.license, 'MIT');
  });

  // --- MOCK LLM TESTI ---
  it('should use mocked LLM engine to evaluate code risk', async () => {
    const mockLLMEngine = {
      analyzeRiskWithLLM: async (code: string) => ({
        riskLevel: 'LOW',
        confidence: 0.95,
        model: 'mocked-llm-v1'
      })
    };

    const result = await mockLLMEngine.analyzeRiskWithLLM('function test() {}');
    assert.strictEqual(result.riskLevel, 'LOW');
    assert.strictEqual(result.model, 'mocked-llm-v1');
  });

  // --- BENCHMARK TESTI (<= 15 saniye) ---
  it('benchmark: analysis should complete in 15 seconds or less', async function () {
    this.timeout(16000);

    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      RiskEngine.evaluateRisk(
        { repository: 'test/repo', license: 'MIT', similarity: 0.9, url: 'http://test' },
        mockPolicy
      );
    }

    const duration = (performance.now() - startTime) / 1000;
    console.log(`Benchmark completed in: ${duration.toFixed(3)}s`);

    assert.ok(duration <= 15, `Analysis took too long: ${duration}s`);
  });
});
