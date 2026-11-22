import 'mocha';
import * as assert from 'assert';
import { LLMService } from '../../llm/llmService';

describe('LLMService (Local and Cloud AI Explainer)', () => {
  it('generates structured license explanation with fallback when offline', async () => {
    const mockSecrets = {
      get: async () => undefined,
      getSecret: async () => undefined
    };
    const service = new LLMService(mockSecrets);

    const result = await service.explainRisk(
      'function test() { return 42; }',
      'GPL-3.0',
      'MIT'
    );

    assert.ok(result.text.length > 0, 'Explanation text must not be empty');
    assert.ok(
      result.text.includes('GPL') || result.text.includes('copyleft'),
      'Explanation must reference the license'
    );
    assert.strictEqual(result.isFallback, true);
    assert.ok(result.timestamp > 0);
  });

  it('reads configuration safely with defaults', () => {
    const service = new LLMService();
    const config = service.readConfig();

    assert.ok(config.provider, 'Provider must be defined');
    assert.ok(config.endpoint, 'Endpoint must be defined');
    assert.ok(config.model, 'Model must be defined');
  });
});
