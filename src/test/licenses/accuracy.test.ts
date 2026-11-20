import 'mocha';
import * as assert from 'assert';
import { LicenseDetector } from '../../licenses/licenseDetector';
import { labelledLicenseSamples } from './fixtures/labelledLicenseSamples';

describe('LicenseDetector accuracy', () => {
  it('has at least 30 labelled repository and header samples', () => {
    assert.ok(labelledLicenseSamples.length >= 30);
  });

  it('detects the labelled licenses with more than 90 percent accuracy', () => {
    const results = labelledLicenseSamples.map(sample => {
      if (sample.kind === 'repository') {
        return {
          expected: sample.expected,
          detected: LicenseDetector.parseRepoMetadataLicense(
            sample.license as { license?: { name?: string; spdx_id?: string } | null }
          ).spdxId
        };
      }

      const detected = LicenseDetector.detectEmbeddedNotice(sample.header ?? '');
      return {
        expected: sample.expected,
        detected: detected?.spdxId ?? 'NONE'
      };
    });

    const hitRate = LicenseDetector.calculateHitRate(results);

    assert.ok(hitRate > 90, `Expected accuracy > 90%, received ${hitRate}%`);
  });
});
