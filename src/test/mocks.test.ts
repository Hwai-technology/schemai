import * as assert from 'assert';
import { MockGitHubSearchService } from './mocks/githubSearch.mock';
import { MockLLMService } from './mocks/llm.mock';

suite('QA-T1: Mocks & Services Validation', () => {
  test('GitHub Search Mock returns expected mock data', async () => {
    const searchService = new MockGitHubSearchService();
    const result = await searchService.searchRepositories('schema');
    
    assert.strictEqual(result.total_count, 2);
    assert.strictEqual(result.items.length, 2);
    assert.strictEqual(result.items[0].name, 'schema-demo');
  });

  test('LLM Mock returns valid completion structure', async () => {
    const llmService = new MockLLMService();
    const result = await llmService.generateCompletion('Analyze this repo');
    
    assert.ok(result.choices.length > 0);
    assert.strictEqual(result.model, 'gpt-4-mock');
    assert.ok(result.choices[0].message.content.includes('Mock response'));
  });
});