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

    // Check for SPDX identifier tag (e.g. SPDX-License-Identifier: GPL-3.0)
    const spdxMatch = text.match(/SPDX-License-Identifier:\s*([A-Za-z0-9.-]+)/i);
    if (spdxMatch && spdxMatch[1]) {
      const rawSpdx = spdxMatch[1].toUpperCase();
      let normalized = rawSpdx;
      if (rawSpdx.startsWith('GPL-3.0')) normalized = 'GPL-3.0';
      else if (rawSpdx.startsWith('GPL-2.0')) normalized = 'GPL-2.0';
      else if (rawSpdx.startsWith('AGPL-3.0')) normalized = 'AGPL-3.0';
      else if (rawSpdx.startsWith('MIT')) normalized = 'MIT';
      else if (rawSpdx.startsWith('APACHE')) normalized = 'Apache-2.0';
      else if (rawSpdx.startsWith('BSD-3')) normalized = 'BSD-3-Clause';
      else if (rawSpdx.startsWith('BSD-2')) normalized = 'BSD-2-Clause';

      return {
        repository: `External Open Source (${normalized})`,
        url: `https://spdx.org/licenses/${normalized}.html`,
        license: normalized,
        similarity: 98,
        spdxId: normalized
      };
    }

    // Short license declarations or keywords
    if (
      lowerText.includes('license: gpl-3.0') ||
      lowerText.includes('license: gplv3') ||
      lowerText.includes('gpl-3.0-only') ||
      lowerText.includes('gpl-3.0-or-later') ||
      (lowerText.includes('gnu general public license') && lowerText.includes('version 3'))
    ) {
      return {
        repository: 'GNU GPL-3.0 Licensed Code',
        url: 'https://www.gnu.org/licenses/gpl-3.0.html',
        license: 'GPL-3.0',
        similarity: 95,
        spdxId: 'GPL-3.0'
      };
    }

    if (
      lowerText.includes('license: agpl-3.0') ||
      lowerText.includes('agpl-3.0-only') ||
      lowerText.includes('agplv3')
    ) {
      return {
        repository: 'GNU AGPL-3.0 Licensed Code',
        url: 'https://www.gnu.org/licenses/agpl-3.0.html',
        license: 'AGPL-3.0',
        similarity: 95,
        spdxId: 'AGPL-3.0'
      };
    }

    if (lowerText.includes('license: mit') || lowerText.includes('licensed under the mit')) {
      return {
        repository: 'External Open Source (MIT)',
        url: 'https://opensource.org/licenses/MIT',
        license: 'MIT',
        similarity: 95,
        spdxId: 'MIT'
      };
    }

    if (lowerText.includes('license: apache-2.0') || lowerText.includes('apache license 2.0')) {
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
