# Changelog

All notable changes to the **SchemAI** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-20

### Added
- **Core Architecture & Coordination (COORD)**:
  - Domain contracts and shared interfaces defined in `src/types.ts` (`CodeFragment`, `SourceMatch`, `LicenseInfo`, `RiskAssessment`, `ProjectPolicy`).
  - Centralized module integration in `src/extension.ts` connecting alerts, analysis, authentication, configuration, history, and quick fix features.
  - End-to-end smoke tests verifying command contributions and module registration.

- **Configuration & Policy Management (`src/config/`)**:
  - Setting `schemaAI.projectLicense` (default: `MIT`) to evaluate license compatibility.
  - Setting `schemaAI.autoAnalyze` (default: `true`) to toggle background paste analysis.
  - Automated workspace root `LICENSE` detection and interactive prompt to adopt detected license.

- **Paste Monitoring & Analysis Queue (`src/analysis/`)**:
  - Non-blocking `PasteMonitor` detecting multi-line clipboard paste events without interrupting typing.
  - Asynchronous `AnalysisQueue` with 500 ms debouncing, fingerprint generation, and SHA-256 caching to prevent duplicate evaluations.
  - Heuristic `CodeAnalyzer.isLikelyCode` ignoring plain natural language fragments while capturing multi-line source code.
  - Manual commands:
    - `schemaAI.analyzeSelection`: scans active editor text selection with progress notifications.
    - `schemaAI.analyzeFile`: scans entire document.

- **Authentication & Security (`src/auth/`, `src/security/`)**:
  - GitHub authentication provider integration via `vscode.authentication.getSession`.
  - Secure credential storage using `vscode.ExtensionContext.secrets` (`SecretStorageService` and `TokenStore`).
  - Automatic migration of legacy plain-text `schemaAI.githubToken` settings into secure storage.
  - Interactive status bar item indicating GitHub connection state.
  - Commands `schemaAI.login` and `schemaAI.disconnect`.

- **Alerts & Diagnostics UI (`src/alerts/`)**:
  - `DiagnosticsManager` populating the VS Code Problems panel with categorized risk diagnostics (High: Error, Medium: Warning).
  - `EditorDecorator` rendering non-intrusive wavy underline decorations on flagged ranges.
  - `AlertHoverProvider` showing license breakdown, source link, and similarity percentage on hover.
  - `RiskCardPanel` Webview displaying detailed attribution summaries and source repository links.

- **License Detection & Compatibility Matrix (`src/licenses/`)**:
  - Embedded SPDX license catalogue and text detection (`LicenseDetector`).
  - Compatibility matrix evaluating copyleft and permissive constraints against project policy.
  - `RiskEngine` scoring risk levels and generating clear legal disclaimers.
  - Fixed fallback summaries for offline operation or when LLM API tokens are unavailable.

- **Source Search (`src/search/`, `src/network/`)**:
  - GitHub Code Search API client with token extraction and similarity scoring.
  - Network rate limiting handling (`HTTP 429` / `403` with `x-ratelimit-remaining` backoff and retry).

- **QuickFix Code Actions & Audit History (`src/quickfix/`, `src/history/`)**:
  - QuickFix provider inserting language-aware attribution comments (`//` or `#`).
  - `schemaAI.ignoreAlert` command marking alerts as false positives and removing diagnostics.
  - `HistoryManager` and `HistoryStorage` recording persistent audit trails in `workspaceState`.

- **Test Suite & CI Gates (`src/test/`)**:
  - Mocha test suite containing 221 passing unit and integration tests across all modules.
  - Strict ESLint configuration and type checking gates.
