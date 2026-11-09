# Feature: Source Search

## 1. Overview
- **Feature Name**: Source Search
- **Assigned Owner**: Alexander
- **Associated ClickUp HUs**: HU-07

## 2. Responsibilities
- Construct and execute queries against the GitHub Code Search API.
- Normalize code snippets and identify significant matching syntax tokens.
- Compute similarity scores between local snippets and remote repositories.
- Return candidate repositories and file paths for license verification.

## 3. Scope Boundaries
- **In Scope**: GitHub Code Search query generation, token filtering, match confidence calculation.
- **Out of Scope**: Network transport retry/rate-limiting logic (handled by `src/network/`), SPDX license parsing (handled by `src/licenses/`).

## 4. Expected Interfaces & Integration Points
- Exposes:
  ```typescript
  export function register(context: vscode.ExtensionContext): void;
  export interface ISearchResult {
      repository: string;
      filePath: string;
      similarityScore: number;
      htmlUrl: string;
  }
  ```
- Consumes:
  - `src/network/` for resilient HTTP transport.
  - `src/security/` / `src/auth/` for authenticated API headers.

## 5. Development & Ownership Rules
- Any team member may change this directory through a pull request. Alexander, as owner, is kept informed; the PR is approved by the reviewer assigned in ClickUp (`rev-*` tag), never by its author.
- Unit tests must mock GitHub API responses to prevent external network calls during automated testing.

