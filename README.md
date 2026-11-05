# SchemAI - Smart External Code & License Risk Analyzer

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 Technology Stack & Ecosystem Compatibility

| Component / Spec | Version / Details | Status |
| :--- | :--- | :--- |
| **VS Code Engine** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **Runtime Environment** | Node.js `18.x` / `20.x` / `22.x` | ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs) |
| **Language & Compiler** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **Testing Framework** | Mocha `^10.8.2` | ![Mocha](https://img.shields.io/badge/Mocha-10.8.2-8D6748?logo=mocha) |
| **Packaging Tool** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **CI/CD Automation** | Multi-Platform GitHub Actions | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
| **License** | MIT License | ![License](https://img.shields.io/badge/License-MIT-green) |

### 🔤 Supported Programming Languages & Activation Triggers
The extension activates dynamically when working with any of the following languages:
* 🟨 **JavaScript** (`onLanguage:javascript`)
* 🟦 **TypeScript** (`onLanguage:typescript`)
* 🐍 **Python** (`onLanguage:python`)
* ☕ **Java** (`onLanguage:java`)
* 🟣 **C#** (`onLanguage:csharp`)
* 🐹 **Go** (`onLanguage:go`)
* ⚙️ **C++** (`onLanguage:cpp`)
* 🦀 **Rust** (`onLanguage:rust`)

---

## 📋 About SchemAI
**SchemAI** is an intelligent Visual Studio Code extension designed to detect, analyze, and audit external source code pasted from third-party repositories. It evaluates legal risks, detects license compatibility issues (e.g. strict copyleft GPL-3.0 inside permissive MIT projects), and offers actionable developer guidance to protect software projects from intellectual property conflicts.

---

## 👥 SchemAI Team

* **Ahmet Asaad Hammoud**
* **Alexander Roldán Palomino**
* **David Vilaseca Pareja**
* **Abdul Rafey Hussain Parveen**
* **Sergio Bueno Gómez**
* **Leon Skalczynski**
* **Yunus Emre Köroğlu**
* **Yusuf Mahdy Mamdouh**

---

## 🖼️ UI & Visual Overview

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 System Architecture & Workflow

### 1. Non-Blocking Paste Detection & Analysis Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 Developer
    participant Editor as 📝 VS Code Editor
    participant Monitor as ⚡ PasteMonitor & Queue
    participant Auth as 🔑 AuthManager
    participant GitHub as 🔍 GitHub Search API
    participant Engine as 🛡️ RiskEngine
    participant UI as 🪟 Live Risk Card & Sidebar

    Developer->>Editor: Paste Code Snippet
    Editor->>Monitor: onDidChangeTextDocument (Instant Capture)
    Monitor->>Monitor: Verify Heuristics & Exclude Internal Code
    Monitor->>Auth: Retrieve Personal User Session Token
    Auth-->>Monitor: Authenticated Bearer Token
    Monitor->>GitHub: Search Public Repositories (Async Queue)
    GitHub-->>Monitor: Return Source Repo & Actual License (SPDX)
    Monitor->>Engine: Evaluate License vs Project Policy (MIT vs GPL)
    Engine-->>UI: Trigger Live Risk Card & Highlight Border Box
    UI->>Editor: Render Problem Diagnostics & Status Bar Update
```

---

### 2. Modular Architecture Diagram

```mermaid
graph TD
    A[🧑‍💻 Developer Editor Action] -->|Paste / Context Menu| B[⚡ SchemAI Core]

    subgraph Monitoring & Processing
        B --> C[PasteMonitor]
        C --> D[AnalysisQueue & LRU Cache]
        D --> E[CodeAnalyzer & Fingerprinting]
    end

    subgraph Security & Authentication
        B --> F[AuthManager - Personal GitHub OAuth]
        B --> G[SecretStorage - Encrypted Credentials]
        F --> H[Status Bar Item]
    end

    subgraph Discovery & Assessment
        D --> I[SourceSearchEngine]
        I -->|GitHub API| J[Public Repositories & Licenses]
        I --> K[RiskEngine - Evidence Evaluation]
    end

    subgraph User Interface & Persistence
        K --> L[Live Risk Card Panel]
        K --> M[SchemAI Sidebar Dashboard]
        K --> N[Diagnostics & In-Editor Highlights]
        K --> O[HistoryManager - Workspace Audit Storage]
    end
```

---

## 🚀 Key Features

* **🔑 Personal GitHub Authentication:** Users authenticate with their personal GitHub account via official VS Code OAuth (`vscode.authentication`). Zero shared developer credentials.
* **🛡️ Non-Blocking Asynchronous Queue:** Real-time paste detection without editor latency, featuring automated debouncing and SHA-256 fingerprint deduplication.
* **🪟 Live Interactive Risk Card:** Side-by-side floating inspection card featuring gradient risk alerts, source repository details, and a color-coded License Compatibility Matrix.
* **📊 Cyberpunk Sidebar Dashboard:** Dedicated Activity Bar panel displaying current file status, recent detections, configuration shortcuts, and audit statistics.
* **🖱️ Editor Context Menu Integration:** Instant right-click actions:
  * `SchemAI: Analyze Selected Code`
  * `SchemAI: Check Last Pasted Code Risk`
  * `SchemAI: View Paste & License History (Audit Log)`
* **📁 Persistent Workspace Audit Log:** Bounded storage tracking past paste analyses, allowing developers to review and mark alerts as False Positives.
* **🔎 Evidence-Based License Detection:** Queries verified repository licenses (`spdx_id`) instead of relying on naive string assumptions.

---

## ⚙️ Building & Testing

### Run Unit Tests & Performance Benchmarks
```bash
npm test
```

### Build & Package Extension (.vsix)
```bash
npm run package
```

### Automated Release
```bash
# Minor release (e.g. 0.1.0 -> 0.2.0)
npm run release

# Patch release (e.g. 0.1.0 -> 0.1.1)
npm run release:patch
```
