const FIXED_LICENSE_SUMMARIES: Record<string, string> = {
  MIT: 'MIT is a permissive license. You may use, modify, and distribute the code, including in proprietary software, as long as the copyright and license notices are preserved.',
  'APACHE-2.0': 'Apache-2.0 is a permissive license. You may use, modify, and distribute the code, including commercially, while preserving notices and complying with its patent and attribution requirements.',
  'BSD-2-CLAUSE': 'BSD-2-Clause is a permissive license. You may use, modify, and distribute the code if the copyright and license notices are retained.',
  'BSD-3-CLAUSE': 'BSD-3-Clause is a permissive license. You may use, modify, and distribute the code if the notices are retained and contributors are not used to endorse derived products without permission.',
  ISC: 'ISC is a permissive license. You may use, modify, and distribute the code, including commercially, while retaining the copyright and license notice.',
  'GPL-2.0': 'GPL-2.0 is a strong copyleft license. Distribution of derivative work generally requires the complete corresponding source code to be made available under GPL-2.0 with the required notices.',
  'GPL-3.0': 'GPL-3.0 is a strong copyleft license. Distribution of derivative work generally requires source code, license notices, and the same GPL-3.0 licensing terms, with additional protections for users and against certain patent restrictions.',
  'AGPL-1.0': 'AGPL-1.0 is a strong copyleft license. Distributed derivative work generally must remain under AGPL-1.0 and include the corresponding source and notices.',
  'AGPL-3.0': 'AGPL-3.0 is a strong copyleft license. Distributed or network-served modified software generally requires offering the corresponding source code under AGPL-3.0 and preserving the required notices.',
  SSPL: 'SSPL is a strong copyleft license. In addition to source-availability obligations for modified software, offering it as a service can require publishing the source of the service and its related management software.'
};

const UNKNOWN_LICENSE_SUMMARY =
  'The license could not be identified. Review the license text and its obligations before using or distributing the code.';

/**
 * Returns a deterministic explanation when an LLM is unavailable.
 */
export function getFixedLicenseSummary(license: string): string {
  const normalizedLicense = license.trim().toUpperCase();
  return FIXED_LICENSE_SUMMARIES[normalizedLicense] ?? UNKNOWN_LICENSE_SUMMARY;
}

export { FIXED_LICENSE_SUMMARIES };
