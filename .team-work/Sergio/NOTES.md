# Task guide — Sergio (HU-14, HU-15)

## 1. Scope of responsibility and folders
- **Assigned folders**: `src/llm/` and `src/quickfix/`
- **User stories (ClickUp HUs)**:
  - **HU-14**: AI model (LLM) integration and explanation of legal risks in plain language.
  - **HU-15**: Providing quick fixes in the editor (`vscode.CodeActionProvider`).

---

## 2. Reference code files organized in this folder
- `llm/llmExplainer.ts`: Writes the prompt templates (Prompts) and calls the AI providers to explain license conflicts and offer the developer alternative solutions.
- `quickfix/codeActionProvider.ts`: Registers the quick actions (Code Actions) that add a legal attribution header (Attribution) or automatically replace the copied code.

---

## 3. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-14-T1  # or HU-15-T1
   ```
2. Write the unit test first (Red Phase):
   - Test building the Prompt message from the detected license data.
   - Test registering CodeActions in the VS Code menu when an active Diagnostic exists.
3. Move the reference code into `src/llm/` and `src/quickfix/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
