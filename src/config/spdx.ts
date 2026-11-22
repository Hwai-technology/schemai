import type { SpdxLicense, SpdxLicenseId } from '../types';

/**
 * SPDX licences supported by the project policy, in display order.
 */
export const SPDX_LICENSES: readonly SpdxLicense[] = [
  { id: 'MIT', name: 'MIT License', category: 'permissive' },
  { id: 'Apache-2.0', name: 'Apache License 2.0', category: 'permissive' },
  {
    id: 'BSD-2-Clause',
    name: 'BSD 2-Clause "Simplified" License',
    category: 'permissive'
  },
  {
    id: 'BSD-3-Clause',
    name: 'BSD 3-Clause "New" or "Revised" License',
    category: 'permissive'
  },
  { id: 'ISC', name: 'ISC License', category: 'permissive' },
  { id: 'MPL-2.0', name: 'Mozilla Public License 2.0', category: 'weak-copyleft' },
  { id: 'LGPL-3.0', name: 'GNU Lesser General Public License v3.0 only', category: 'weak-copyleft' },
  { id: 'GPL-2.0', name: 'GNU General Public License v2.0 only', category: 'strong-copyleft' },
  { id: 'GPL-3.0', name: 'GNU General Public License v3.0 only', category: 'strong-copyleft' },
  { id: 'AGPL-3.0', name: 'GNU Affero General Public License v3.0 only', category: 'strong-copyleft' }
];

/**
 * Identifiers of every supported SPDX licence, in the same order as {@link SPDX_LICENSES}.
 */
export const SPDX_LICENSE_IDS: readonly SpdxLicenseId[] = SPDX_LICENSES.map(
  (license) => license.id
);

const SPDX_LICENSE_ID_SET: ReadonlySet<string> = new Set(SPDX_LICENSE_IDS);

/**
 * Checks whether a value is a supported SPDX identifier.
 */
export function isSpdxLicenseId(value: string): value is SpdxLicenseId {
  return SPDX_LICENSE_ID_SET.has(value);
}

/**
 * Returns the catalogue entry for a supported SPDX identifier.
 */
export function getSpdxLicense(id: string): SpdxLicense | undefined {
  return SPDX_LICENSES.find((license) => license.id === id);
}

/**
 * Returns the identifier unchanged when it is supported, otherwise throws.
 */
export function assertSpdxLicenseId(id: string): SpdxLicenseId {
  if (!isSpdxLicenseId(id)) {
    throw new Error(`Unsupported SPDX license: ${id}`);
  }
  return id;
}
