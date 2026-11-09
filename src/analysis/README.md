# Feature: Code Analysis & Paste Monitoring

## 1. Overview
- **Feature Name**: Code Analysis & Paste Monitoring
- **Assigned Owner**: Ahmet
- **Associated ClickUp HUs**: HU-05, HU-06

## 2. Responsibilities
- Monitor paste events within active text editors (`vscode.workspace.onDidChangeTextDocument`).
- Extract code chunks and detect potential external code insertions.
- Implement manual analysis commands (`schemaAI.analyzeSelection`, `schemaAI.checkLastPasted`).
- Orchestrate the verification pipeline by dispatching snippets to search and license modules.

## 3. Scope Boundaries
- **In Scope**: Editor text change listeners, snippet extraction, selection command triggers.
- **Out of Scope**: Direct GitHub search API calls, license policy calculations, or diagnostic rendering.

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  ```
- Consumes:
  - `src/search/` for snippet querying.
  - `src/licenses/` for risk assessment.
  - `src/alerts/` for presenting diagnostic results.

## 5. Development & Ownership Rules
- Changes to this directory require Ahmet's review and approval.
- Tests must verify document event handling without blocking editor responsiveness.

