# Task guide — Ahmet (COORD, HU-05, HU-06)

## 1. Scope of responsibility and folders
- **Assigned folders**: `src/core/` and `src/analysis/`
- **User stories (ClickUp HUs)**:
  - **COORD**: Coordinates the extension lifecycle, the shared `extension.ts` structure, and the definition of the shared interfaces in `types.ts`.
  - **HU-05**: Asynchronous paste monitoring (`PasteMonitor`) and non-blocking analysis queue (`AnalysisQueue`).
  - **HU-06**: Manual commands (`schemaAI.analyzeSelection`, `schemaAI.checkLastPasted`).

---

## 2. Reference code files organized in this folder
- `analysis/codeAnalyzer.ts`: Code inspection, fingerprint generation (Fingerprinting), stripping of comments and whitespace, and token similarity calculation.
- `analysis/pasteMonitor.ts`: Listens for text paste events and identifies suspicious fragments.
- `analysis/analysisQueue.ts`: Asynchronous processing queue with debouncing and cancellation of repeated requests (Debounce & Cancellation).
- `core/coordinator.ts`: Command registration template and wiring to the extension.

---

## 3. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-05-T1
   ```
2. Write the unit test first (Red Phase):
   - Test detection of paste events and fingerprint generation.
   - Verify the user interface is not blocked.
3. Move and refine the reference code from this folder into `src/analysis/` or `src/core/` (Green Phase).
4. Run the tests and make sure they all pass:
   ```bash
   npm test
   ```
5. Push the branch and open a Pull Request to `develop`, and assign the reviewer from the `rev-` tag in ClickUp.
