/**
 * Reference Code for David (HU-09)
 * License compatibility matrix rules.
 */
export class CompatibilityMatrix {
  private static readonly PERMISSIVE = new Set(['MIT', 'APACHE-2.0', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC']);
  private static readonly COPYLEFT_STRONG = new Set(['GPL-2.0', 'GPL-3.0', 'AGPL-1.0', 'AGPL-3.0', 'SSPL']);
  private static readonly COPYLEFT_WEAK = new Set(['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'EPL-2.0']);

  public static isPermissive(spdxId: string): boolean {
    return this.PERMISSIVE.has(spdxId.toUpperCase());
  }

  public static isStrongCopyleft(spdxId: string): boolean {
    return this.COPYLEFT_STRONG.has(spdxId.toUpperCase());
  }

  public static isWeakCopyleft(spdxId: string): boolean {
    return this.COPYLEFT_WEAK.has(spdxId.toUpperCase());
  }
}
