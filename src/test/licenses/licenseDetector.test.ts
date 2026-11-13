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
});
