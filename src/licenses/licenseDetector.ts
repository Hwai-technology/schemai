export interface DetectedLicenseResult {
  repository: string;
  url: string;
  license: string;
  similarity: number;
  spdxId: string;
}

export interface RepositoryLicenseMetadata {
  license?: {
    name?: string;
    spdx_id?: string;
  } | null;
}

export interface ParsedRepositoryLicense {
  licenseName: string;
  spdxId: string;
}

export class LicenseDetector {
  public static detectEmbeddedNotice(text: string): DetectedLicenseResult | undefined {
    const lowerText = text.toLowerCase().replace(/\s+/g, ' ');

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

  public static parseRepoMetadataLicense(repoData: RepositoryLicenseMetadata): ParsedRepositoryLicense {
    const metadata = repoData.license;
    const spdxId = metadata?.spdx_id;

    if (!spdxId || spdxId === 'NOASSERTION') {
      return { licenseName: 'NONE', spdxId: 'NONE' };
    }

    return {
      licenseName: spdxId || metadata.name || 'UNKNOWN',
      spdxId
    };
  }
}
