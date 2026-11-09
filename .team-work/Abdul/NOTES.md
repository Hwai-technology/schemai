# Task guide — Abdul (HU-11, HU-12)

## 1. Scope of responsibility and folders
- **Assigned folder**: `src/alerts/`
- **User stories (ClickUp HUs)**:
  - **HU-11**: Editor alerts and diagnostics (`DiagnosticsManager`, `EditorDecorator`).
  - **HU-12**: Interactive hover provider (`SchemAIHoverProvider`) and risk display card (`RiskCardPanel`).

---

## 2. Reference code files organized in this folder
- `alerts/diagnosticsManager.ts`: Manages VS Code diagnostics (`vscode.DiagnosticCollection`) and shows warnings/errors under the copied lines.
- `alerts/editorDecorator.ts`: Draws the glowing border (Glowing Code Box) and the squiggly underline beneath risky code.
- `alerts/hoverProvider.ts`: Fills the interactive hover window with the license details, its status and links to open the repository.
- `alerts/riskCardPanel.ts`: Interactive web card (Webview Panel) showing the compatibility matrix and license details.

---

## 3. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-11-T1
   ```
2. Write the unit test first (Red Phase):
   - Verify a Diagnostic is added to the collection when a FORBIDDEN or HIGH result arrives.
   - Verify the alert is cleared on SAFE.
3. Move and refine the reference code into `src/alerts/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
