export interface DetectedLicenseResult {
  repository: string;
  url: string;
  license: string;
  similarity: number;
  spdxId: string;
}

/**
 * Reference Code for David (HU-08)
 * Extracted from prototype `sourceSearch.ts`.
 * Focuses on authentic embedded legal copyright notices and GitHub repo SPDX extraction.
 */
export class LicenseDetector {
  public static detectEmbeddedNotice(text: string): DetectedLicenseResult | undefined {
    const lowerText = text.toLowerCase();

    // 1. GPL-3.0 authentic legal notice
    const hasGplLegalNotice =
      lowerText.includes('gnu general public license') &&
      lowerText.includes('without even the implied warranty of merchantability') &&
      (lowerText.includes('free software foundation') || lowerText.includes('either version 3 of the license'));

    if (hasGplLegalNotice) {
      return {
        repository: 'GNU GPL-3.0 Licensed Code',
        url: 'https://www.gnu.org/licenses/gpl-3.0.html',
        license: 'GPL-3.0',
        similarity: 99,
        spdxId: 'GPL-3.0'
      };
    }

    // 2. MIT authentic legal notice
    const hasMitLegalNotice =
      lowerText.includes('permission is hereby granted, free of charge') &&
      lowerText.includes('substantial portions of the software') &&
      lowerText.includes('mit license');

    if (hasMitLegalNotice) {
      return {
        repository: 'External Open Source (MIT)',
        url: 'https://opensource.org/licenses/MIT',
        license: 'MIT',
        similarity: 95,
        spdxId: 'MIT'
      };
    }

    // 3. Apache-2.0 authentic legal notice
    const hasApacheLegalNotice =
      lowerText.includes('apache license, version 2.0') &&
      lowerText.includes('you may not use this file except in compliance with the license');

    if (hasApacheLegalNotice) {
      return {
        repository: 'External Open Source (Apache-2.0)',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
        license: 'Apache-2.0',
        similarity: 95,
        spdxId: 'Apache-2.0'
      };
    }

    return undefined;
  }

  public static parseRepoMetadataLicense(repoData: any): { licenseName: string; spdxId: string } {
    if (repoData?.license) {
      return {
        licenseName: repoData.license.spdx_id || repoData.license.name || 'UNKNOWN',
        spdxId: repoData.license.spdx_id || 'UNKNOWN'
      };
    }
    return { licenseName: 'UNKNOWN', spdxId: 'UNKNOWN' };
  }
}
