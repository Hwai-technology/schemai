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
});
