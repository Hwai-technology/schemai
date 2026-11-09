# Feature: LLM Reasoning & Explanations

## 1. Overview
- **Feature Name**: LLM Reasoning & Explanations
- **Assigned Owner**: Sergio
- **Associated ClickUp HUs**: HU-14

## 2. Responsibilities
- Integrate with LLM API backends to generate contextual explanations for detected license risks.
- Formulate prompt templates translating complex legal license incompatibilities into plain-English advice.
- Provide recommendations on compliance options (e.g., dual licensing, alternative libraries).

## 3. Scope Boundaries
- **In Scope**: Prompt composition, LLM client calling, parsing and formatting explanations.
- **Out of Scope**: Core algorithmic license matrix evaluation (handled by `src/licenses/`), CodeAction menu registration (handled by `src/quickfix/`).

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  export function explainRisk(snippet: string, riskData: unknown): Promise<string>;
  ```
- Consumes:
  - License analysis data from `src/licenses/`.
  - Credentials from `src/security/`.

## 5. Development & Ownership Rules
- Any team member may change this directory through a pull request. Sergio, as owner, is kept informed; the PR is approved by the reviewer assigned in ClickUp (`rev-*` tag), never by its author.
- All LLM interactions must fail gracefully with descriptive error handling when unconfigured or offline.
