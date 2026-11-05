# 🚀 Team Development, Release & Automated Publishing Guide

This document is the official guide for the **SchemAI** engineering team. It explains how to build and test the extension locally, how automated continuous integration and deployment (CI/CD) work via **GitHub Actions**, how releases are published to global marketplaces, and how to resolve common environment issues.

---

## 📌 Table of Contents
1. [Prerequisites & Node.js Requirement](#1-prerequisites--nodejs-requirement)
2. [Root Cause Analysis: `styleText is not a function`](#2-root-cause-analysis-styletext-is-not-a-function)
3. [Local Build, Test & Packaging](#3-local-build-test--packaging)
4. [Semantic Versioning & Creating a Release](#4-semantic-versioning--creating-a-release)
5. [Automated CI/CD Workflow Architecture](#5-automated-cicd-workflow-architecture)
6. [Configuring Marketplace Secrets in GitHub](#6-configuring-marketplace-secrets-in-github)
7. [How Users Receive Automatic Updates](#7-how-users-receive-automatic-updates)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. Prerequisites & Node.js Requirement

* **Node.js**: **v20.x LTS** or **v22.x** (Active LTS).
  > ⚠️ **IMPORTANT**: Do **NOT** use Node.js 18.x. The VS Code packaging tool (`@vscode/vsce` v3+) relies on standard APIs introduced in Node.js 20.12.0+.
* **npm**: v10+ (bundled with Node 20/22).
* **VS Code**: Version 1.85.0 or newer.
* **Git**: Installed and configured.

---

## 2. Root Cause Analysis: `styleText is not a function`

### The Error:
```text
Run npx vsce package --allow-missing-repository
/home/runner/work/schemai/schemai/node_modules/@vscode/vsce/out/util.js:204
    [LogMessageType.DONE]: (0, util_1.styleText)(['bgGreen', 'black'], ' DONE '),
                                                ^
TypeError: (0 , util_1.styleText) is not a function
Node.js v18.20.8
```

### Why it happened:
1. The packaging tool `@vscode/vsce` (version 3.x) imports `styleText` directly from Node's internal `util` module:
   ```javascript
   const { styleText } = require('node:util');
   ```
2. `util.styleText()` was added to Node.js in **v20.12.0** and **v21.7.0**.
3. In older runners (e.g. Node 18.20.8), `util.styleText` does not exist (`undefined`), throwing a runtime `TypeError`.
4. In addition, Node.js 18 reached official **End-of-Life (EOL)** in April 2025.

### The Fix:
We updated `.github/workflows/ci-matrix.yml` to remove `18.x` from the test matrix:
```yaml
matrix:
  os: [ubuntu-latest, windows-latest, macos-latest]
  node-version: [20.x, 22.x]
```
All CI builds on Windows, Ubuntu, and macOS now run on supported LTS versions where `vsce package` succeeds with 0 errors.

---

## 3. Local Build, Test & Packaging

Before pushing any changes or tagging a release, run the following steps in your terminal:

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript
npm run compile

# 3. Run automated unit tests and benchmark (< 15s)
npm test

# 4. Package extension into a local .vsix file
npm run package
```

This will produce the installation file in the repository root:
`schema-ai-X.Y.Z.vsix`

### Installing & Testing in VS Code:
To install and test your newly built package in your local VS Code editor:
```bash
code --install-extension schema-ai-0.1.1.vsix --force
```

for antigravity:
```bash
antigravity

```
Or open VS Code, navigate to **Extensions (`Ctrl+Shift+X`)** ➡️ click the three dots **`...`** (Views and More Actions) ➡️ **`Install from VSIX...`** ➡️ select `schema-ai-0.1.1.vsix`.

---

## 4. Semantic Versioning & Creating a Release

SchemAI follows [Semantic Versioning (SemVer)](https://semver.org/):
* **Patch (`0.1.1` ➡️ `0.1.2`)**: Bug fixes, heuristic optimizations, false positive corrections.
* **Minor (`0.1.0` ➡️ `0.2.0`)**: New backward-compatible features, new UI dashboards, added license policies.
* **Major (`0.1.0` ➡️ `1.0.0`)**: Breaking changes or complete architectural overhauls.

### One-Command Release (Automated Script):
We provide an automated script `release.sh`:

```bash
# For a bug fix / patch release:
./release.sh patch

# For a new feature / minor release:
./release.sh minor
```

### What `release.sh` does automatically:
1. Runs full test suite and TypeScript compilation (`npm test`).
2. Bumps the version number in `package.json`.
3. Creates a Git commit: `chore(release): bump version to vX.Y.Z`.
4. Creates a Git tag: `vX.Y.Z`.
5. Pushes both the commit and the tag to GitHub (`git push origin main --tags`).

---

## 5. Automated CI/CD Workflow Architecture

When a version tag `v*` is pushed (or a pull request is merged into `main`), GitHub Actions automatically coordinates the release pipeline:

```
+-------------------------------------------------------------+
| 1. Developer pushes tag: git push origin v0.1.2             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. GitHub Actions runs: .github/workflows/release.yml        |
|    - Checks out repo and sets up Node 20+                   |
|    - Runs code compilation & tests                          |
|    - Executes: npx vsce package                             |
|    - Generates standalone: schema-ai-0.1.2.vsix             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Create GitHub Release                                    |
|    - Generates release notes from commits                   |
|    - Attaches schema-ai-0.1.2.vsix as downloadable asset    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. Publish to Global Extension Registries:                  |
|    a) Open VSX Registry (Eclipse Foundation / Open-VSX)     |
|       Command: npx ovsx publish -p $OVSX_PAT                |
|    b) Visual Studio Marketplace (Microsoft)                 |
|       Command: npx vsce publish -p $VSCE_PAT                |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 5. Automatic Client-Side Upgrades:                          |
|    VS Code installations worldwide detect the new version    |
|    and upgrade in the background automatically!             |
+-------------------------------------------------------------+
```

---

## 6. Configuring Marketplace Secrets in GitHub

To allow GitHub Actions to publish automatically to the public registries, two secrets must be configured in the GitHub repository:

Navigate to: **GitHub Repository ➡️ Settings ➡️ Secrets and variables ➡️ Actions ➡️ New repository secret**

| Secret Name | Purpose | Where to Get It |
| :--- | :--- | :--- |
| `OVSX_PAT` | Access token for **Open VSX Registry** | [open-vsx.org Account Settings](https://open-vsx.org/user-settings/tokens) (Token must have permission for namespace `schemai-team`) |
| `VSCE_PAT` | Personal Access Token for **VS Code Marketplace** | [Azure DevOps](https://dev.azure.com) (Token with scope: `Marketplace -> Publish`) |

> 🛡️ **Safe Fallback**: If secrets are not yet configured, the release workflow will skip the marketplace upload step safely without breaking the build, ensuring the GitHub Release and `.vsix` download are always created.

---

## 7. How Users Receive Automatic Updates

1. **Marketplace Installs (Automatic)**:
   * Users who install SchemAI from the **Open VSX Registry** or **VS Code Marketplace** have automatic background updates enabled by default in VS Code (`extensions.autoUpdate: true`).
   * VS Code checks for new extension versions daily. When `0.1.2` is published, it silently downloads and installs it.
2. **Direct VSIX Sideloading (Manual)**:
   * Users who manually install a `.vsix` file will not receive automatic updates until they switch to the marketplace version, or manually install a newer `.vsix`.

---

## 8. Troubleshooting & FAQ

### Q1: Why did GitHub Actions fail with `styleText is not a function`?
* **Answer**: The job was running on an old Node 18 runner. `@vscode/vsce` v3 requires Node 20.12.0+. The matrix in `.github/workflows/ci-matrix.yml` has been updated to `[20.x, 22.x]`.

### Q2: Why did GitHub Actions report `Unrecognized named-value: 'secrets'`?
* **Answer**: GitHub Actions does not allow direct access to `secrets` inside step-level `if:` conditions. The correct pattern is to map the secret to a job-level environment variable (`env: OVSX_PAT: ${{ secrets.OVSX_PAT }}`), then evaluate `if: env.OVSX_PAT != ''`.

### Q3: How do I test the extension in development mode without packaging?
* **Answer**: Press **`F5`** in VS Code with this project open. It will launch an **Extension Development Host** window with SchemAI loaded in real-time with full debugging capabilities.

---
**SchemAI Engineering Team 🛡️**
