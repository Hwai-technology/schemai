# Feature: Alerts & Diagnostic UI

## 1. Overview
- **Feature Name**: Alerts & Diagnostic UI
- **Assigned Owner**: Abdul
- **Associated ClickUp HUs**: HU-11, HU-12

## 2. Responsibilities
- Manage VS Code `DiagnosticCollection` to highlight high-risk code sections in the editor.
- Provide custom text editor decorations (gutter glyphs, inline warning styling).
- Register VS Code Hover Provider (`vscode.languages.registerHoverProvider`) displaying license breakdown and risk summaries.
- Render risk card previews with contextual details.

## 3. Scope Boundaries
- **In Scope**: Editor diagnostics, decorations, hover tooltips, status feedback.
- **Out of Scope**: Evaluating risk scores (handled by `src/licenses/`), monitoring paste events (handled by `src/analysis/`).

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  export function showRiskAlert(document: vscode.TextDocument, range: vscode.Range, riskInfo: unknown): void;
  ```
- Consumes:
  - Risk assessment objects produced by `src/licenses/`.

## 5. Development & Ownership Rules
- Any team member may change this directory through a pull request. Abdul, as owner, is kept informed; the PR is approved by the reviewer assigned in ClickUp (`rev-*` tag), never by its author.
- Ensure all diagnostics and decorations are properly disposed of when documents close.
