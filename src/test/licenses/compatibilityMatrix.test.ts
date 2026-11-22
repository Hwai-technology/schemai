import 'mocha';
import * as assert from 'assert';
import { CompatibilityMatrix } from '../../licenses/compatibilityMatrix';

describe('CompatibilityMatrix', () => {
  it('marks MIT code in an MIT project as compatible', () => {
    const result = CompatibilityMatrix.evaluate('MIT', 'MIT');

    assert.strictEqual(result.isCompatible, true);
    assert.strictEqual(result.riskLevel, 'low');
  });

  it('marks GPL-3.0 code in an MIT project as incompatible with high risk', () => {
    const result = CompatibilityMatrix.evaluate('GPL-3.0', 'MIT');

    assert.strictEqual(result.isCompatible, false);
    assert.strictEqual(result.riskLevel, 'high');
  });

  it('marks GPL-3.0 code in a GPL-3.0 project as compatible', () => {
    const result = CompatibilityMatrix.evaluate('GPL-3.0', 'GPL-3.0');

    assert.strictEqual(result.isCompatible, true);
    assert.strictEqual(result.riskLevel, 'low');
  });

  it('requires manual review when the source license is unknown', () => {
    const result = CompatibilityMatrix.evaluate('UNKNOWN', 'MIT');

    assert.strictEqual(result.isCompatible, false);
    assert.strictEqual(result.riskLevel, 'manual-review');
  });
});
