# SchemAI - Smart External Code & License Risk Analyzer

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 Technology Stack & Ecosystem Compatibility

| Component / Spec | Version / Details | Status |
| :--- | :--- | :--- |
| **VS Code Engine** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **Runtime Environment** | Node.js `16.x` / `18.x` / `20.x` | ![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=nodedotjs) |
| **Language & Compiler** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **Testing Framework** | Mocha `^10.2.0` | ![Mocha](https://img.shields.io/badge/Mocha-10.2.0-8D6748?logo=mocha) |
| **Packaging Tool** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **CI/CD Automation** | GitHub Actions Workflow | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
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
**SchemAI** is a smart extension for **Visual Studio Code** designed to detect and analyze code pasted from external sources (such as GitHub or Stack Overflow), evaluating legal risk and license compatibility to protect software projects.

---

## 👥 SchemAI Team

* **Ahmet Asaad Hammoud**
* **Alexander Roldán Palomino**
* **David Vilaseca Pareja**
* **Abdul Rafey Hussain Parveen**
* **Sergio Bueno Gómez**
* **Suliman Mimon Youjili**
* **Leon Skalczynski**
* **Yunus Emre Köroğlu**
* **Yusuf Mahdy Mamdouh**

---

## 🖼️ UI & Visual Overview

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 Architecture & Diagrams

### 1. Paste Detection & Analysis Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 Developer
    participant VSCode as 📝 VS Code Editor
    participant SchemAI as ⚡ SchemAI Extension
    participant GitHub as 🔍 GitHub API
    participant Engine as 🛡️ Risk Engine

    Developer->>VSCode: Paste Code Snippet
    VSCode->>SchemAI: Trigger Event (onDidChangeTextDocument)
    SchemAI->>SchemAI: Extract Code Fingerprint & Structure
    SchemAI->>GitHub: Search Public Repositories
    GitHub-->>SchemAI: Return Match Meta & License (e.g. GPL-3.0)
    SchemAI->>Engine: Evaluate License vs Project Policy (MIT)
    Engine-->>SchemAI: Risk Assessment (High Risk / Incompatible)
    SchemAI->>VSCode: Display Warning & Code Highlights
```

---

### 2. System Architecture

```mermaid
graph TD
    A[🧑‍💻 Developer Code Action] -->|Paste / Select| B[⚡ SchemAI VSCode Core]
    
    subgraph SchemAI Engine
        B --> C[🔍 Code Analyzer Service]
        B --> D[🌐 Source Search Service]
        B --> E[🛡️ Risk Engine Evaluator]
    end
    
    C -->|Extract Tokens & AST| D
    D -->|GitHub Code Search API| F[🐙 GitHub Repositories]
    F -->|Return Meta & License| D
    D -->|Source Metadata| E
    E -->|Matrix Assessment| G[📊 Risk Score & Report]
    G -->|Interactive Diagnostics| H[💻 VS Code UI Diagnostics & Quick Fix]
```

---

### 3. License Compatibility Matrix

```mermaid
quadrantChart
    title Project License Compatibility Matrix
    x-axis Low Risk --> High Risk
    y-axis Low Restrictions --> High Restrictions (Copyleft)
    quadrant-1 ❌ Incompatible (Strict Copyleft - GPL)
    quadrant-2 ⚠️ Review Needed (Weak Copyleft - LGPL/MPL)
    quadrant-3 ✅ Fully Compatible (Permissive - MIT/Apache)
    quadrant-4 ℹ️ Attribution Required (BSD)
    MIT: [0.1, 0.2]
    Apache-2.0: [0.25, 0.3]
    BSD-3-Clause: [0.35, 0.4]
    LGPL-3.0: [0.65, 0.7]
    GPL-3.0: [0.9, 0.95]
```

---

## 🚀 Key Features
* **Automated Detection:** Instant scanning of pasted snippets directly inside the editor.
* **Source Matching:** Integration with public GitHub APIs to identify code origins.
* **Risk Evaluation:** Automatic comparison against target project licenses (e.g., MIT, Apache, GPL).
* **Interactive Alerts:** In-editor diagnostics and guidance for developer decisions.

---

## ⚙️ Building & Testing

### Run Unit Tests
```bash
npm test
```

### Package VSIX Extension
```bash
npm run package
```
