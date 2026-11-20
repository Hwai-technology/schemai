import 'mocha';
import * as assert from 'assert';
import { RiskEngine } from '../../licenses/riskEngine';

interface SourceMatch {
  repository: string;
  url: string;
  license: string;
  similarity: number;
}

interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}

const sourceMatch: SourceMatch = {
  repository: 'example/gpl-repository',
  url: 'https://github.com/example/gpl-repository',
  license: 'GPL-3.0',
  similarity: 0.98
};

const mitPolicy: ProjectPolicy = {
  projectLicense: 'MIT',
  allowedLicenses: ['MIT'],
  restrictedLicenses: ['GPL-3.0']
};

const gplPolicy: ProjectPolicy = {
  projectLicense: 'GPL-3.0',
  allowedLicenses: ['GPL-3.0'],
  restrictedLicenses: []
};

describe('RiskEngine', () => {
  it('uses the injected project policy when evaluating a source', () => {
    const result = RiskEngine.evaluateRisk(sourceMatch, mitPolicy);

    assert.strictEqual(result.riskLevel, 'high');
    assert.match(result.reason, /GPL-3\.0.*MIT/i);
  });

  it('classifies GPL-3.0 code in an MIT project as high risk with a reason', () => {
    const result = RiskEngine.evaluateRisk(sourceMatch, mitPolicy);

    assert.strictEqual(result.riskLevel, 'high');
    assert.ok(result.reason.length > 0);
  });

  it('classifies GPL-3.0 code in a GPL-3.0 project as low risk', () => {
    const result = RiskEngine.evaluateRisk(sourceMatch, gplPolicy);

    assert.strictEqual(result.riskLevel, 'low');
  });

  it('includes a legal notice in every assessment result', () => {
    const result = RiskEngine.evaluateRisk(sourceMatch, mitPolicy);

    assert.strictEqual(typeof result.legalNotice, 'string');
    assert.ok(result.legalNotice.length > 0);
  });

  it('builds the restricted-license reason from the actual policy', () => {
    const result = RiskEngine.evaluateRisk(
      {
        repository: 'example/agpl-repository',
        url: 'https://github.com/example/agpl-repository',
        license: 'AGPL-3.0',
        similarity: 0.98
      },
      {
        projectLicense: 'Apache-2.0',
        allowedLicenses: ['Apache-2.0'],
        restrictedLicenses: ['AGPL-3.0']
      }
    );

    assert.strictEqual(result.riskLevel, 'high');
    assert.match(result.reason, /AGPL-3\.0.*Apache-2\.0/i);
  });
});
