# SchemAI Feature Matrix & Architecture Governance

This document establishes the official ownership, scope boundaries, interface contracts, and collaboration rules for SchemAI Sprint 1.

---

## 1. Feature Directory & Ownership Matrix

| Directory | Owner | ClickUp HUs | Core Responsibilities |
|---|---|---|---|
| `src/core/` | **Ahmet** | COORD | Extension lifecycle coordinator, service container, shared utilities |
| `src/analysis/` | **Ahmet** | HU-05, HU-06 | Code analyzer, paste event monitor, manual analysis commands |
| `src/search/` | **Alexander** | HU-07 | GitHub Search API integration, query builder, snippet similarity |
| `src/licenses/` | **David** | HU-08, HU-09 | License detection, license compatibility matrix, risk evaluation engine |
| `src/alerts/` | **Abdul** | HU-11, HU-12 | Editor diagnostics, text decorations, hover provider, risk card preview |
| `src/config/` | **Leon** | HU-01, HU-04 | Policy evaluation engine, workspace LICENSE detection, settings management |
| `src/auth/` | **Yusuf** | HU-02 | GitHub authentication provider, OAuth flow, session management |
| `src/security/` | **Yusuf** | HU-03 | VS Code SecretStorage, token encryption, API credential hygiene |
| `src/history/` | **Yusuf** | HU-13 | Audit log storage, paste/risk event persistence, query interface |
| `src/llm/` | **Sergio** | HU-14 | LLM explanation provider, prompt templates, AI risk rationalization |
| `src/quickfix/` | **Sergio** | HU-15 | VS Code CodeActionProvider, automated attribution & remediation actions |
| `src/network/` | **Yunus** | HU-10 | Resilient HTTP client, rate limiting (403/429), offline queue, retries |
| `src/test/` | **Yunus** | QA, CI | End-to-end testing, integration harnesses, CI test runner configuration |

---

## 2. Feature Responsibilities & Boundaries

### `src/core/` & `src/analysis/` (Owner: Ahmet)
- **Scope**:
  - Central extension coordination and lifecycle orchestration.
  - Text document paste event listening (`vscode.workspace.onDidChangeTextDocument`).
  - Selection and manual trigger commands (`schemaAI.analyzeSelection`, `schemaAI.checkLastPasted`).
  - Orchestration pipeline coordinating search, license detection, and alerts.
- **Boundaries**:
  - Does not directly query the GitHub API (delegates to `src/search/`).
  - Does not compute license compatibility matrices (delegates to `src/licenses/`).
  - Does not render UI diagnostics or decorations (delegates to `src/alerts/`).

### `src/search/` (Owner: Alexander)
- **Scope**:
  - GitHub Code Search API client.
  - Query construction, normalization, and token matching.
  - Match scoring and similarity thresholds.
- **Boundaries**:
  - Does not handle network-level retries or backoff logic directly (delegates to `src/network/`).
  - Does not parse SPDX licenses (delegates to `src/licenses/`).

### `src/licenses/` (Owner: David)
- **Scope**:
  - SPDX license identifier parsing and normalization.
  - Compatibility evaluation against declared project policies.
  - Risk categorization (High / Medium / Low / Compliant).
- **Boundaries**:
  - Does not read workspace configuration directly (receives policy from `src/config/`).
  - Does not render editor UI elements (delegates to `src/alerts/`).

### `src/alerts/` (Owner: Abdul)
- **Scope**:
  - VS Code `DiagnosticCollection` management for detected risks.
  - Editor text decorations (gutter icons, inline highlights).
  - Hover provider (`vscode.languages.registerHoverProvider`) displaying risk summaries.
  - Risk card preview webview / panel.
- **Boundaries**:
  - Does not evaluate license compatibility or risk score (consumes output from `src/licenses/`).
  - Does not listen to editor paste events directly (triggered by `src/analysis/`).

### `src/config/` (Owner: Leon)
- **Scope**:
  - Workspace configuration management (`vscode.workspace.getConfiguration('schemaAI')`).
  - Automatic detection and parsing of root `LICENSE` file.
  - Policy rule validation and defaults.
- **Boundaries**:
  - Does not manage secret tokens (delegates to `src/security/`).
  - Does not calculate license conflicts (delegates to `src/licenses/`).

### `src/auth/`, `src/security/`, `src/history/` (Owner: Yusuf)
- **Scope**:
  - `src/auth/`: GitHub authentication session management (`vscode.authentication.getSession`).
  - `src/security/`: Secure credential storage using `ExtensionContext.secrets`.
  - `src/history/`: Audit logging of detected pastes, risk ratings, and actions taken.
- **Boundaries**:
  - Security does not expose plaintext secrets through logs or diagnostic messages.
  - History stores audit state; it does not render the UI audit view dashboard (deferred past Sprint 1).

### `src/llm/`, `src/quickfix/` (Owner: Sergio)
- **Scope**:
  - `src/llm/`: Generating plain-English explanations of license risk and remediation recommendations.
  - `src/quickfix/`: VS Code `CodeActionProvider` offering quick-fix actions (e.g., add attribution, replace snippet).
- **Boundaries**:
  - Quick-fix registers actions based on diagnostics provided by `src/alerts/`.
  - LLM features must handle missing API credentials gracefully without blocking core analysis.

### `src/network/`, `src/test/` (Owner: Yunus)
- **Scope**:
  - `src/network/`: Resilient HTTP client wrapping fetch/axios with exponential backoff, rate limit handling (HTTP 403 / 429), and offline status detection.
  - `src/test/`: Unit, integration, and suite test execution configuration, mock servers, and CI verification workflows.
- **Boundaries**:
  - Network layer is transport-only; it does not contain GitHub-specific query logic.

---

## 3. Shared Integration Rules

1. **Explicit Feature Registration Contract**:
   Every feature folder must expose an entry point conforming to the registration contract:
   ```typescript
   export function register(context: vscode.ExtensionContext): void;
   ```
2. **Shared Coordination Files**:
   - `src/extension.ts` and `src/types.ts` are strictly shared coordination files owned by the Coordinator (**Ahmet**).
   - No developer may unilaterally rewrite or refactor `src/extension.ts` or `src/types.ts`.
   - Feature integration into `src/extension.ts` is performed only through coordinated, reviewed PRs calling each module's `register(context)` function.
3. **No Cross-Folder Code Duplication**:
   Common types must reside in `src/types.ts`. Shared utilities must reside in `src/core/`.
4. **Decoupled Interfaces**:
   Features interact through typed interfaces defined in `src/types.ts`. Direct circular imports between feature directories are forbidden.

---

## 4. Development & Pull Request Governance

- **Feature Branch Naming**:
  Branches must be branched off `develop` using:
  ```bash
  feature/HU-xx-Tn
  ```
- **TDD Requirement**:
  The first commit in any feature branch must be the unit/integration test demonstrating the red phase. Subsequent commits provide the minimal implementation to achieve green.
- **No Direct Pushes**:
  Direct pushes to `develop` are blocked.
- **Code Review**:
  Every PR requires:
  - 1 formal approval from the designated reviewer specified by the `rev-` tag in ClickUp.
  - The module owner is informed (mentioned in the PR) when files inside their directory are modified; the approval still comes from the designated reviewer.
  - Passing CI checks (compilation, linting, tests).
- **Prototyping Staging**:
  The prototype code is for reference only. Implementation code must be written or ported intentionally to meet Sprint 1 specifications. Local staging and experiments should be conducted in individual `.team-work/<Name>/` workspaces, which are excluded from Git tracking.

