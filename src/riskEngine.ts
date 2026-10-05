import { CandidateSource, ProjectPolicy, RiskLevel, AnalysisResult } from './types';

export class RiskEngine {
  /**
   * Assesses risk level by comparing detected license against project policy rules
   */
  public static evaluateRisk(
    sourceMatch: CandidateSource | undefined,
    policy: ProjectPolicy
  ): { riskLevel: RiskLevel; reason: string } {
    if (!sourceMatch) {
      return {
        riskLevel: 'LOW',
        reason: 'No matching external repository found above similarity threshold.'
      };
    }

    const detectedLicense = sourceMatch.license.toUpperCase();
    const projectLicense = policy.projectLicense.toUpperCase();

    if (detectedLicense === 'UNKNOWN') {
      return {
        riskLevel: 'UNKNOWN',
        reason: 'Source identified, but license could not be verified automatically.'
      };
    }

    if (policy.restrictedLicenses.map(l => l.toUpperCase()).includes(detectedLicense)) {
      return {
        riskLevel: 'HIGH',
        reason: `Detected license (${sourceMatch.license}) is restricted by project policy (${policy.projectLicense}).`
      };
    }

    if (detectedLicense !== projectLicense && !policy.allowedLicenses.map(l => l.toUpperCase()).includes(detectedLicense)) {
      return {
        riskLevel: 'MEDIUM',
        reason: `Potential compatibility issue between external license (${sourceMatch.license}) and project policy (${policy.projectLicense}).`
      };
    }

    return {
      riskLevel: 'LOW',
      reason: `Detected license (${sourceMatch.license}) is compatible with project policy (${policy.projectLicense}).`
    };
  }
}
