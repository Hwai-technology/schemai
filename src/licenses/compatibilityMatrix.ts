export type CompatibilityRiskLevel = 'low' | 'high' | 'manual-review';

export interface CompatibilityResult {
  isCompatible: boolean;
  riskLevel: CompatibilityRiskLevel;
}

export class CompatibilityMatrix {
  public static evaluate(sourceLicense: string, projectLicense: string): CompatibilityResult {
    const source = this.normalize(sourceLicense);
    const project = this.normalize(projectLicense);

    if (this.isUnknown(source) || this.isUnknown(project)) {
      return {
        isCompatible: false,
        riskLevel: 'manual-review'
      };
    }

    if (source === project || this.isPermissive(source)) {
      return {
        isCompatible: true,
        riskLevel: 'low'
      };
    }

    if (this.isStrongCopyleft(source)) {
      return {
        isCompatible: false,
        riskLevel: 'high'
      };
    }

    return {
      isCompatible: false,
      riskLevel: 'manual-review'
    };
  }

  private static normalize(spdxId: string): string {
    return spdxId.trim().toUpperCase();
  }

  private static isUnknown(spdxId: string): boolean {
    return spdxId === '' || spdxId === 'UNKNOWN' || spdxId === 'NONE' || spdxId === 'NOASSERTION';
  }

  private static isPermissive(spdxId: string): boolean {
    return new Set(['MIT', 'APACHE-2.0', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC']).has(spdxId);
  }

  private static isStrongCopyleft(spdxId: string): boolean {
    return new Set(['GPL-2.0', 'GPL-3.0', 'AGPL-1.0', 'AGPL-3.0', 'SSPL']).has(spdxId);
  }
}
