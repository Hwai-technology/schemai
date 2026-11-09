# Feature: Configuration & Policy Management

## 1. Overview
- **Feature Name**: Configuration & Policy Management
- **Assigned Owner**: Leon
- **Associated ClickUp HUs**: HU-01, HU-04

## 2. Responsibilities
- Manage VS Code extension settings (`schemaAI.projectLicense`, analysis thresholds, policy modes).
- Automatically detect and parse the project's root `LICENSE` file upon workspace opening.
- Define and supply the active project compliance policy to dependent modules.

## 3. Scope Boundaries
- **In Scope**: Extension configuration reader, workspace root LICENSE discovery, policy definitions.
- **Out of Scope**: Secret token storage (handled by `src/security/`), license compatibility logic (handled by `src/licenses/`).

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  export interface IProjectPolicy {
      targetLicense: string;
      strictMode: boolean;
  }
  ```
- Consumes:
  - VS Code workspace configuration API (`vscode.workspace.getConfiguration`).

## 5. Development & Ownership Rules
- Changes to this directory require Leon's review and approval.
- Ensure fallback defaults apply gracefully when no root LICENSE file exists.
