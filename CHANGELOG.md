# Changelog

All notable changes to the **SchemAI** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-05

### Added
- **Personal GitHub Authentication (HU-02):** Seamless sign-in using VS Code's official Authentication API (`vscode.authentication`). Each user operates with their own personal GitHub account.
- **Status Bar Integration:** Displays active GitHub connection status (`$(github) SchemAI: @username`) with account management and switching.
- **Secure Credential Storage (HU-03):** Integrated `vscode.SecretStorage` for encrypted storage of API keys and automated migration of legacy plaintext tokens.
- **Non-blocking Paste Monitoring (HU-05):** Asynchronous background queue (`AnalysisQueue`) with debouncing and SHA-256 fingerprint deduplication cache.
- **Persistent Paste & Risk Tracker (HU-16 GAP):** Workspace-scoped circular audit history in `context.workspaceState` preserving past snippets, detected licenses, and risk states.
- **Editor Context Menu Actions:** Added right-click commands in editor (`Analyze Selected Code`, `Check Last Pasted Code Risk`, and `View Paste & License History`).
- **Interactive Cyberpunk Dashboard & Live Risk Card:**
  - Modern primary sidebar view (`SchemAISidebarViewProvider`) displaying live file analysis, recent detections, and audit statistics.
  - Floating/Beside Live Risk Card (`RiskCardPanel`) featuring cyan-to-purple gradient alert banners, source repo details, and color-coded License Compatibility Matrix (e.g. MIT vs GPL-3.0).
- **Diagnostics & Glowing Decorations (HU-11 & HU-12):** Integrated Problems panel diagnostics, hover previews, and rounded glowing border box highlighting for forbidden pasted code.
- **Automated Multi-Channel Release Pipeline:** GitHub Actions workflow supporting GitHub Releases, Open VSX, and Visual Studio Marketplace.

### Changed
- Replaced heuristic GPL default assumption with dynamic GitHub repository license inspection (`spdx_id`).
- Upgraded risk classification to evidence-based levels: `FORBIDDEN`, `WARNING`, `SAFE`, and `UNKNOWN`.

---

## [0.0.12] - 2026-10-19

### Added
- GitHub API and LLM service unit mocks with benchmark test suite (executing in under 15 seconds).

---

## [0.0.11] - 2026-10-15

### Added
- Shotcut / Meltytech C++ signature heuristics for comment-less GPL copyleft code detection.

---

## [0.0.10] - 2026-10-10

### Added
- Support for Fine-Grained Personal Access Tokens and native VS Code session detection.
