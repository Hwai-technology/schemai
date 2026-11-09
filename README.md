# SchemAI - External Code & License Risk Analyzer

SchemAI is a Visual Studio Code extension designed to detect external code, search public sources (GitHub), evaluate open-source license compatibility against project policies, and assess risk upon code paste or manual trigger.

---

## 1. Project Purpose & Sprint 1 Initialization

This repository has been initialized from a clean, orphan development branch (`ddevelop`) for the official start of Sprint 1. The prototype codebase serves as architectural reference in a preserved branch, while Sprint 1 development follows strict engineering rigor, modular feature isolation, test-driven progression, and mandatory peer review.

Target release for Sprint 1 is **v0.1.0** delivered via GitHub Releases (.vsix).

---

## 2. Repository Structure

```text
project/
├── .gitignore               # Strict ignore rules (build, secrets, .team-work)
├── README.md                # Project & development guide
├── LICENSE                  # MIT License
├── package.json             # Core extension metadata and build scripts
├── FEATURES.md              # Feature ownership & integration governance
│
├── src/
│   ├── types.ts             # Shared architectural contracts & interfaces
│   ├── extension.ts         # Central VS Code entry point skeleton
│   │
│   ├── core/                # Core extension coordination & infrastructure
│   ├── analysis/            # Code analysis, paste listener, manual commands
│   ├── search/              # GitHub search API client & snippet matching
│   ├── licenses/            # License detector, risk engine, matrix
│   ├── alerts/              # Editor diagnostics, hovers, decorations, cards
│   ├── config/              # Policy evaluation, LICENSE detection, settings
│   ├── auth/                # GitHub OAuth / authentication provider
│   ├── security/            # Secret storage, token management, sanitization
│   ├── history/             # Audit logs & tracking storage
│   ├── llm/                 # LLM provider integration & reasoning
│   ├── quickfix/            # VS Code CodeAction provider & automated remediation
│   ├── network/             # Resilient HTTP client, rate limits, retry logic
│   └── test/                # Test harness, shared fixtures, CI suites
│
└── .team-work/              # Private local developer staging (git-ignored)
```

Each feature directory initially contains a specification `README.md` defining ownership, assigned ClickUp User Stories (HUs), interfaces, and boundaries.

---

## 3. Feature Ownership

Feature modules are strictly owned by designated team members:

| Owner | Feature Modules | ClickUp HUs | Scope Summary |
|---|---|---|---|
| **Ahmet** | `src/core/`, `src/analysis/` | COORD, HU-05, HU-06 | Core lifecycle, code analyzer, paste monitor, command registration |
| **Alexander** | `src/search/` | HU-07 | GitHub client, code search queries, snippet similarity |
| **David** | `src/licenses/` | HU-08, HU-09 | LicenseDetector, riskEngine, compatibility matrix |
| **Abdul** | `src/alerts/` | HU-11, HU-12 | Editor diagnostics, decorations, hover tooltips, risk card |
| **Leon** | `src/config/` | HU-01, HU-04 | Project policy, workspace LICENSE detection, configuration settings |
| **Yusuf** | `src/auth/`, `src/security/`, `src/history/` | HU-02, HU-03, HU-13 | Authentication, token security, paste/analysis audit logging |
| **Sergio** | `src/llm/`, `src/quickfix/` | HU-14, HU-15 | LLM explanation provider, quick-fix remediation actions |
| **Yunus** | `src/network/`, `src/test/` | HU-10, QA, CI | Network resilience (offline, rate limit, retry), test framework, CI pipeline |

For comprehensive ownership and integration rules, refer to [FEATURES.md](file:///c:/Users/ahahm/Desktop/work%20Ahmet%20brother/extention/FEATURES.md).

---

## 4. Branch Workflow

Development strictly follows an isolated branch lifecycle:

1. **Base Branch**: All development branches originate from and target `ddevelop`.
2. **Branch Naming**: Feature branches must strictly follow the format:
   ```bash
   feature/HU-xx-Tn
   ```
   (e.g., `feature/HU-05-T1`, `feature/HU-08-T2`).
3. **No Direct Pushes**: Direct commits or pushes to `ddevelop` are forbidden.
4. **Independent History**: The `main` branch preserves historical prototype work and must remain untouched.

---

## 5. Pull Request & Quality Policy

Every task delivered in Sprint 1 must adhere to the following workflow:

- **Test-First (TDD)**: The initial commit of every feature branch must contain the unit or integration test (red phase).
- **Targeted Implementation**: Port or implement only the exact code necessary to satisfy the assigned HU. Do not bulk-copy prototype files.
- **Ownership Respect**: Developers modify only their designated feature directory.
- **Cross-Feature PRs**: Modifications affecting shared coordination files (`src/types.ts`, `src/extension.ts`) or another owner's directory require explicit approval from the affected owner.
- **Mandatory PR Criteria**:
  - Pull request linked to corresponding ClickUp HU.
  - At least 1 review approval from the designated reviewer (`rev-` tag in ClickUp).
  - Green CI pipeline (clean build, linting, and 100% passing tests).

