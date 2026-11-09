export type RiskLevel =
  | 'FORBIDDEN'
  | 'WARNING'
  | 'SAFE'
  | 'UNKNOWN'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}

export interface CandidateSource {
  repository: string;
  url: string;
  license: string;
  similarity: number;
  spdxId?: string;
}

/**
 * Reference Code for David (HU-09)
 * Evaluates license compatibility and risk against defined project policy.
 */
export class RiskEngine {
  public static evaluateRisk(
    sourceMatch: CandidateSource | undefined,
    policy: ProjectPolicy
  ): { riskLevel: RiskLevel; reason: string } {
    if (!sourceMatch) {
      return {
        riskLevel: 'SAFE',
        reason: 'No matching external repository found above similarity threshold.'
      };
    }

    const detectedLicense = (sourceMatch.license || 'UNKNOWN').toUpperCase();
    const projectLicense = (policy.projectLicense || 'MIT').toUpperCase();

    // 1. Evidence-based: If license is unknown, never guess GPL or declare safe
    if (detectedLicense === 'UNKNOWN' || detectedLicense === '') {
      return {
        riskLevel: 'UNKNOWN',
        reason: `Source repository identified (${sourceMatch.repository}), but license could not be verified automatically.`
      };
    }

    // 2. Restricted by project policy (copyleft / forbidden)
    const restrictedList = (policy.restrictedLicenses || []).map(l => l.toUpperCase());
    if (restrictedList.includes(detectedLicense)) {
      return {
        riskLevel: 'FORBIDDEN',
        reason: `Detected license (${sourceMatch.license}) is restricted by project policy (${policy.projectLicense}). Copying this code may force copyleft obligations.`
      };
    }

    // 3. Allowed or matches project license
    const allowedList = (policy.allowedLicenses || []).map(l => l.toUpperCase());
    if (detectedLicense === projectLicense || allowedList.includes(detectedLicense)) {
      return {
        riskLevel: 'SAFE',
        reason: `Detected license (${sourceMatch.license}) is compatible with project policy (${policy.projectLicense}).`
      };
    }

    // 4. Requires manual review (weak copyleft or unclassified terms)
    return {
      riskLevel: 'WARNING',
      reason: `Potential compatibility or attribution requirement between external license (${sourceMatch.license}) and project policy (${policy.projectLicense}).`
    };
  }
}
