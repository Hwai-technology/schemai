# SchemAI v0.1.0 — Release Notes (Sprint 1)

**Release Date:** Friday, 20 November 2026  
**Target Review:** Sprint Review 1 (Monday, 23 November 2026)  
**Version:** 0.1.0  

---

## 1. Executive Summary

SchemAI v0.1.0 marks the completion of **Sprint 1**, delivering the foundational architecture, domain contracts, module integration, and essential risk detection pipelines for external code pasted into VS Code.

The extension autonomously monitors clipboard paste activity, analyzes source code fragments, evaluates license compatibility against project policies (such as MIT or GPL), provides editor diagnostics and hover cards, and enables one-click attribution fixes and alert auditing.

---

## 2. Key Highlights in v0.1.0

### Non-blocking Asynchronous Paste Analysis
- Background paste detection without freezing the editor UI.
- Intelligent debouncing (500 ms) and SHA-256 fingerprint deduplication.
- Filters out plain conversational prose, ensuring only relevant source code is analyzed.

### License & Compliance Engine
- Built-in SPDX license detection engine (`LicenseDetector`).
- Compatibility matrix classifying permissive vs. strong/weak copyleft licenses.
- Detailed risk explanations, severity scoring, and fallback summaries when offline.

### Seamless Editor Integration & Alerts
- Real-time diagnostics in the VS Code Problems panel.
- Distinct inline decorations and contextual hover tooltips with repository links.
- Rich Webview risk card previewing matched code snippets safely with strict CSP.

### Zero-Leak Security & GitHub Authentication
- Official VS Code GitHub session authentication (`schemaAI.login`).
- All tokens stored exclusively in OS-encrypted `ExtensionContext.secrets`.
- Verified zero-token leakage across logs, settings, and git commits.

### Quick Fixes & Auditing
- Language-aware code actions inserting properly formatted attribution headers.
- False-positive dismissal (`schemaAI.ignoreAlert`) with persistent state tracking.

---

## 3. Sprint 1 Metric & KPI Summary (MET — KPI 1)

- **Completed User Stories at Sprint Close:** 4 / 15 (HU-01, HU-02, HU-03, HU-11)
- **Official KPI 1 Result:** **26.7 %** (🔴 ROJO)
- **Unified Threshold:** Target ≥ 80 % (P5 & Task unified).
- **Corrective Action Plan for Sprint 2:**
  1. Re-estimate remaining 11 user stories and adjust team velocity to match proven capacity.
  2. Implement strict WIP limits and a 12h–24h pull request review turnaround SLA.
  3. Final tag `v0.1.0` to be applied following the formal Sprint Review on Monday, 23/11.

---

## 4. Verification & Quality Gates

- **Unit & Integration Tests:** 226 / 226 passing (`npm test`).
- **Smoke Tests:** Fully verified activation and command registration (`schemaAI.analyzeSelection`, `schemaAI.analyzeFile`, `schemaAI.login`, `schemaAI.disconnect`, `schemaAI.ignoreAlert`, `schemaAI.explainRiskWithAI`).
- **Static Analysis:** ESLint 100% clean (`npm run lint` exit code 0).

---

## 5. Team Contributors (SchemAI Core Team)

- **Ahmet Asaad Hammoud** ([@Eng-Ahmet](https://github.com/Eng-Ahmet)) — Coordinator, Module Contracts & Analysis Pipeline
- **Abdul-rhman Hammoud** ([@Abdul-rhman-hammoud](https://github.com/Abdul-rhman-hammoud)) — Alerts, Editor Diagnostics & Decorators
- **Alexander** — GitHub Code Search & Similarity Calculator
- **David** — SPDX License Detector, Compatibility Matrix & Risk Engine
- **Leon** — Configuration, Workspace License Detection & Policies
- **Sergio** — AI / LLM Explainer & QuickFix Provider
- **Yunus Emre Köroğlu** ([@yunusemrekoroglu](https://github.com/yunusemrekoroglu)) — Network Resilience, HTTP Client & Rate Limiting
- **Yusuf** — GitHub Authentication, Secret Storage & Audit History
