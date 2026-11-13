import 'mocha';
import * as assert from 'assert';
import type { SpdxLicenseId } from '../../types';
import {
  SPDX_LICENSES,
  SPDX_LICENSE_IDS,
  assertSpdxLicenseId,
  getSpdxLicense,
  isSpdxLicenseId
} from '../../config/spdx';

const REQUIRED_LICENSES: readonly SpdxLicenseId[] = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'GPL-2.0',
  'GPL-3.0',
  'AGPL-3.0',
  'LGPL-3.0',
  'MPL-2.0'
];

describe('SPDX catalogue (HU-01 T2)', () => {
  it('contains every supported licence with a unique id and a name', () => {
    const ids = SPDX_LICENSES.map((license) => license.id);

    for (const required of REQUIRED_LICENSES) {
      assert.ok(ids.includes(required), `Missing SPDX licence: ${required}`);
    }

    assert.strictEqual(new Set(ids).size, ids.length, 'SPDX ids must be unique');
    for (const license of SPDX_LICENSES) {
      assert.ok(license.name.trim().length > 0, `Missing name for ${license.id}`);
    }
  });

  it('exposes the supported ids in catalogue order', () => {
    assert.deepStrictEqual(
      [...SPDX_LICENSE_IDS],
      SPDX_LICENSES.map((license) => license.id)
    );
    for (const required of REQUIRED_LICENSES) {
      assert.ok(SPDX_LICENSE_IDS.includes(required), `Missing SPDX id: ${required}`);
    }
  });

  it('accepts a supported SPDX id', () => {
    assert.strictEqual(isSpdxLicenseId('MIT'), true);
    assert.strictEqual(assertSpdxLicenseId('Apache-2.0'), 'Apache-2.0');
    assert.strictEqual(getSpdxLicense('GPL-3.0')?.id, 'GPL-3.0');
  });

  it('rejects an invalid SPDX id', () => {
    assert.strictEqual(isSpdxLicenseId('Not-A-License'), false);
    assert.strictEqual(getSpdxLicense('Not-A-License'), undefined);
    assert.throws(
      () => assertSpdxLicenseId('Not-A-License'),
      /Unsupported SPDX license: Not-A-License/
    );
  });

  it('treats SPDX ids as case-sensitive', () => {
    assert.strictEqual(isSpdxLicenseId('mit'), false);
    assert.throws(() => assertSpdxLicenseId('mit'));
  });
});
