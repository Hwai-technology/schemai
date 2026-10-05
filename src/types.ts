export interface CandidateSource {
  repository: string;
  url: string;
  license: string;
  similarity: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface AnalysisResult {
  isCode: boolean;
  language: string;
  fingerprint: string;
  sourceMatch?: CandidateSource;
  projectPolicy: string;
  riskLevel: RiskLevel;
  reason: string;
  confidence: number;
}

export interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}
