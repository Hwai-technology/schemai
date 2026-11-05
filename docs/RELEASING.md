# SchemAI Release, Distribution & Update Management Guide

This document defines the automated release pipeline, distribution channels, semantic versioning policy, and update delivery architecture for the **SchemAI** VS Code extension.

---

## 1. Distribution Channels & Automatic Update Architecture

### How Automatic Updates Work in VS Code:
```
+--------------------------------------------------------------------------+
|  1. Developer tags new version: git tag v0.2.0 && git push --tags       |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|  2. GitHub Actions Pipeline (.github/workflows/release.yml)              |
|     - Runs tests & TypeScript compilation                               |
|     - Builds VSIX package                                               |
|     - Generates GitHub Release + attached .vsix asset                   |
|     - Publishes to Visual Studio Marketplace & Open VSX                 |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|  3. Client-Side VS Code Background Update Engine                         |
|     - VS Code checks marketplace daily: extensions.autoUpdate = true    |
|     - Detects v0.2.0 > v0.1.0                                           |
|     - Downloads and installs the new version automatically               |
|     - User needs zero manual downloads or manual re-installations!      |
+--------------------------------------------------------------------------+
```

### Important Architecture Note on Manual VSIX Installs:
* When a user manually installs a `.vsix` file via `Extensions: Install from VSIX...`, VS Code treats it as a sideloaded package.
* **To ensure automatic updates for all users:** SchemAI is published to the official [Visual Studio Marketplace](https://marketplace.visualstudio.com) and [Open VSX Registry](https://open-vsx.org).
* Once an extension is installed from the Marketplace, VS Code continuously and automatically keeps it up to date.

---

## 2. GitHub Actions Secrets Configuration

To enable automated zero-touch publishing, configure the following secrets in your repository settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Description | Source |
| :--- | :--- | :--- |
| `VS_MARKETPLACE_PAT` | Personal Access Token with **Marketplace (Publish)** scope | [Azure DevOps / Marketplace Management](https://marketplace.visualstudio.com/manage) |
| `OVSX_PAT` | Personal Access Token for Open-VSX Registry | [Open-VSX.org Account Settings](https://open-vsx.org/user-settings/tokens) |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions for creating Releases | Built-in |

---

## 3. Semantic Versioning Policy (SemVer)

SchemAI strictly follows [Semantic Versioning 2.0.0](https://semver.org/):

* **PATCH (`x.y.Z`):** Bug fixes, documentation updates, and performance optimizations that do not alter public contracts.
  ```bash
  npm run release:patch
  ```
* **MINOR (`x.Y.0`):** New features and enhancements that are backward-compatible (e.g. new UI views, new license detection heuristics).
  ```bash
  npm run release
  # or: ./release.sh minor
  ```
* **MAJOR (`X.0.0`):** Breaking architectural changes or substantial contract overhauls.
  ```bash
  npm run release:major
  ```

---

## 4. Release Checklist (Before Bumping Version)

1. [ ] Ensure working tree is clean and all feature commits are merged into `main`.
2. [ ] Run tests and compilation locally:
   ```bash
   npm test
   ```
3. [ ] Verify `CHANGELOG.md` reflects all recent changes under the new version header.
4. [ ] Execute the release script:
   ```bash
   ./release.sh minor
   ```
5. [ ] Monitor the GitHub Actions run at: `https://github.com/Hwai-technology/schemai/actions`.
6. [ ] Verify that the GitHub Release asset (`schema-ai-*.vsix`) is uploaded and the marketplace entries are updated.

---

## 5. Rollback & Emergency Recovery Procedures

If a critical bug is discovered in a published version:

1. **Hotfix Release (Recommended):**
   * Revert the problematic commit or apply the fix on `main`.
   * Immediately publish a new PATCH version (e.g., `0.1.1` to replace `0.1.0`):
     ```bash
     ./release.sh patch
     ```
   * VS Code will prioritize the higher semantic version and automatically upgrade all users.

2. **Unpublishing from Marketplace (Extreme Cases Only):**
   * To pull an extension version from Visual Studio Marketplace:
     ```bash
     npx vsce unpublish schemai-team.schema-ai@0.1.0 -p $VS_MARKETPLACE_PAT
     ```
   * To unpublish from Open VSX:
     ```bash
     npx ovsx unpublish schemai-team.schema-ai@0.1.0 -p $OVSX_PAT
     ```

