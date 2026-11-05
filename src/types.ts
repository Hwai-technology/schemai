export interface CandidateSource {
  repository: string;
  url: string;
  license: string;
  similarity: number;
  spdxId?: string;
}

export type RiskLevel =
  | 'FORBIDDEN'
  | 'WARNING'
  | 'SAFE'
  | 'UNKNOWN'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type ReviewStatus = 'PENDING' | 'REVIEWED' | 'FALSE_POSITIVE';

export interface AnalysisResult {
  isCode: boolean;
  language: string;
  fingerprint: string;
  fingerprintHash?: string;
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

export interface GitHubUser {
  id: string;
  login: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: GitHubUser;
  accessToken?: string;
}

export interface PasteAuditEntry {
  id: string;
  timestamp: number;
  fileName: string;
  filePath: string;
  languageId: string;
  lineRange?: { startLine: number; endLine: number };
  snippetPreview: string;
  fingerprintHash: string;
  sourceMatch?: CandidateSource;
  riskLevel: RiskLevel;
  reason: string;
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
}
