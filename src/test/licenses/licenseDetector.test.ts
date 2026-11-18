import 'mocha';
import * as assert from 'assert';
import { LicenseDetector } from '../../licenses/licenseDetector';

describe('LicenseDetector', () => {
  it('detects an embedded GPL-3.0 license notice', () => {
    const text = `
      GNU GENERAL PUBLIC LICENSE
      Version 3, 29 June 2007
      Copyright Free Software Foundation
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    `;

    const result = LicenseDetector.detectEmbeddedNotice(text);

    assert.ok(result);
    assert.strictEqual(result.spdxId, 'GPL-3.0');
  });

  it("extracts 'MIT' from repository SPDX metadata", () => {
    const result = LicenseDetector.parseRepoMetadataLicense({
      license: {
        spdx_id: 'MIT'
      }
    });

    assert.strictEqual(result.spdxId, 'MIT');
  });

  it("returns 'NONE' when repository license metadata is null", () => {
    const result = LicenseDetector.parseRepoMetadataLicense({
      license: null
    });

    assert.strictEqual(result.spdxId, 'NONE');
  });

  it("treats 'NOASSERTION' as 'NONE'", () => {
    const result = LicenseDetector.parseRepoMetadataLicense({
      license: {
        spdx_id: 'NOASSERTION'
      }
    });

    assert.strictEqual(result.spdxId, 'NONE');
  });

  it('reports a repository without a license for manual review', () => {
    const result = LicenseDetector.parseRepoMetadataLicense({
      license: null
    });

    assert.strictEqual(result.licenseName, 'sin licencia');
    assert.strictEqual(result.requiresReview, true);
  });

  it('calculates the detection hit rate over a labelled sample', () => {
    const hitRate = LicenseDetector.calculateHitRate([
      { expected: 'MIT', detected: 'MIT' },
      { expected: 'GPL-3.0', detected: 'GPL-3.0' },
      { expected: 'NONE', detected: 'MIT' },
      { expected: 'Apache-2.0', detected: 'Apache-2.0' }
    ]);

    assert.strictEqual(hitRate, 75);
  });
});
