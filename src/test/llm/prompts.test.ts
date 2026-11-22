import 'mocha';
import * as assert from 'assert';
import { buildExplanationPrompt } from '../../llm/prompts';

describe('Explanation prompts (HU-14 T2)', () => {
  it('builds an English prompt with both license names and obligations', () => {
    const prompt = buildExplanationPrompt({
      snippet: 'const answer = 42;',
      detectedLicense: 'GPL-3.0',
      projectLicense: 'MIT',
      locale: 'en-US'
    });

    assert.ok(prompt.includes('GPL-3.0'));
    assert.ok(prompt.includes('MIT'));
    assert.ok(prompt.includes('obligations'));
    assert.ok(prompt.includes('Explain in English'));
  });

  it('builds a Spanish prompt when VS Code uses a Spanish locale', () => {
    const prompt = buildExplanationPrompt({
      snippet: 'const respuesta = 42;',
      detectedLicense: 'GPL-3.0',
      projectLicense: 'MIT',
      locale: 'es-ES'
    });

    assert.ok(prompt.includes('GPL-3.0'));
    assert.ok(prompt.includes('MIT'));
    assert.ok(prompt.includes('obligaciones'));
    assert.ok(prompt.includes('Explica en español'));
  });

  it('limits the code included in the prompt to 300 characters', () => {
    const snippet = 'x'.repeat(301);
    const prompt = buildExplanationPrompt({
      snippet,
      detectedLicense: 'Apache-2.0',
      projectLicense: 'MIT',
      locale: 'en'
    });

    assert.strictEqual(prompt.split('Code snippet:\n')[1].length, 300);
  });
});
