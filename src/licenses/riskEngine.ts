export type RiskLevel = 'high' | 'low';

export interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}

export interface SourceMatch {
  repository: string;
  url: string;
  license: string;
  similarity: number;
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  reason: string;
  legalNotice: string;
}

const LEGAL_NOTICE =
  'This assessment is informational and does not replace legal advice. Review the applicable license and obligations before reuse.';

export class RiskEngine {
  public static evaluateRisk(source: SourceMatch, policy: ProjectPolicy): RiskAssessment {
    const sourceLicense = source.license.trim().toUpperCase();
    const projectLicense = policy.projectLicense.trim().toUpperCase();
    const restrictedLicenses = policy.restrictedLicenses.map(license => license.trim().toUpperCase());
    const allowedLicenses = policy.allowedLicenses.map(license => license.trim().toUpperCase());

    if (restrictedLicenses.includes(sourceLicense)) {
      return {
        riskLevel: 'high',
        reason: `The detected license (${source.license}) is restricted by the project policy (${policy.projectLicense}).`,
        legalNotice: LEGAL_NOTICE
      };
    }

    if (sourceLicense === projectLicense || allowedLicenses.includes(sourceLicense)) {
      return {
        riskLevel: 'low',
        reason: `The detected license (${source.license}) is compatible with the project policy (${policy.projectLicense}).`,
        legalNotice: LEGAL_NOTICE
      };
    }

    return {
      riskLevel: 'high',
      reason: `The detected license (${source.license}) requires review against the project policy (${policy.projectLicense}).`,
      legalNotice: LEGAL_NOTICE
    };
  }
}
