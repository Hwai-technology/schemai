# Task guide — David (HU-08, HU-09)

## 1. Scope of responsibility and folders
- **Assigned folder**: `src/licenses/`
- **User stories (ClickUp HUs)**:
  - **HU-08**: License and SPDX ID detector (`LicenseDetector`) working from file headers and GitHub metadata.
  - **HU-09**: Risk assessment engine (`RiskEngine`) and open-source license compatibility matrix.

---

## 2. How the code was separated from the prototype
1. **The license inspection logic was extracted from `sourceSearch.ts`**:
   - Detecting explicit embedded copyright notices (GPL-3.0, MIT, Apache-2.0).
   - Extracting `spdx_id` from the GitHub repository data (`/repos/:owner/:repo`).
2. **Risk assessment engine `riskEngine.ts`**:
   - Matching the detected license against the project policy (`SAFE`, `WARNING`, `FORBIDDEN`, `UNKNOWN`).
   - Classifying strict reciprocal licenses (Copyleft / AGPL / GPL).
3. **Compatibility matrix `compatibilityMatrix.ts`**: Rules for mutual compatibility between licenses.

---

## 3. Reference code files organized in this folder
- `licenses/licenseDetector.ts`: Detects legal licenses from text and from the API response.
- `licenses/riskEngine.ts`: Assesses the severity level and the reasoning behind the conflict.
- `licenses/compatibilityMatrix.ts`: Compatibility matrix across the different licenses (GPL, MIT, Apache, BSD, AGPL).

---

## 4. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-08-T1
   ```
2. Write the unit test first (Red Phase):
   - Test recognition of embedded GPL-3.0 license text.
   - Test the MIT/GPL compatibility matrix and the rejection of prohibited licenses as FORBIDDEN.
3. Move the organized reference code into `src/licenses/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
