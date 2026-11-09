# Feature: License Detection & Risk Engine

## 1. Overview
- **Feature Name**: License Detection & Risk Engine
- **Assigned Owner**: David
- **Associated ClickUp HUs**: HU-08, HU-09

## 2. Responsibilities
- Detect and parse SPDX license identifiers from remote repository metadata and headers.
- Maintain the open-source license compatibility matrix (e.g., GPL, MIT, Apache, BSD, AGPL).
- Evaluate license compatibility against the target project's license policy.
- Compute categorized risk assessments (High, Medium, Low, Compliant).

## 3. Scope Boundaries
- **In Scope**: SPDX identification, license compatibility rules, risk engine algorithms.
- **Out of Scope**: Workspace configuration parsing (handled by `src/config/`), diagnostic UI presentation (handled by `src/alerts/`).

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  export interface ILicenseRiskAssessment {
      spdxId: string;
      riskLevel: 'high' | 'medium' | 'low' | 'none';
      isCompatible: boolean;
      summary: string;
  }
  ```
- Consumes:
  - Policy configuration from `src/config/`.

## 5. Development & Ownership Rules
- Changes to this directory require David's review and approval.
- The risk engine must be comprehensively covered with matrix compatibility test suites.

