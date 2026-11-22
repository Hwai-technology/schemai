import 'mocha';
import * as assert from 'assert';
import { FIXED_LICENSE_SUMMARIES, getFixedLicenseSummary } from '../../llm/fixedSummaries';
import { LLMClient } from '../../llm/llmClient';

describe('Fixed license summaries (HU-14 T3)', () => {
  it('provides a summary for every license in the compatibility matrix', () => {
    const matrixLicenses = [
      'MIT',
      'Apache-2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'ISC',
      'GPL-2.0',
      'GPL-3.0',
      'AGPL-1.0',
      'AGPL-3.0',
      'SSPL'
    ];

    for (const license of matrixLicenses) {
      assert.ok(getFixedLicenseSummary(license).length > 0);
    }

    assert.strictEqual(Object.keys(FIXED_LICENSE_SUMMARIES).length, matrixLicenses.length);
  });

  it('normalizes SPDX identifiers and gives unknown licenses an explicit summary', () => {
    assert.strictEqual(getFixedLicenseSummary(' apache-2.0 '), getFixedLicenseSummary('Apache-2.0'));
    assert.match(getFixedLicenseSummary('UNKNOWN'), /could not be identified/i);
  });

  it('uses the fixed summary when the LLM has no token', async () => {
    const client = new LLMClient(
      { post: async () => ({ text: 'LLM explanation' }) },
      { getLlmApiKey: async () => undefined }
    );

    assert.strictEqual(
      await client.explain('snippet', { detectedLicense: 'GPL-3.0' }),
      getFixedLicenseSummary('GPL-3.0')
    );
  });
});
