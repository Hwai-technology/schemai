# Task guide — Leon (HU-01, HU-04)

## 1. Scope of responsibility and folders
- **Assigned folder**: `src/config/`
- **User stories (ClickUp HUs)**:
  - **HU-01**: Extension settings and management of the project's license policy (`PolicyManager`, `Settings`).
  - **HU-04**: Automatic inspection of the `LICENSE` file in the project root and extraction of the repository's license.

---

## 2. How the code was separated from the prototype
1. **Moving the hardcoded policy (Hardcoded Policy)**:
   - In the prototype, the policy (`ProjectPolicy`) was hardcoded inside `analysisQueue.ts` and `extension.ts`:
     ```typescript
     allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'],
     restrictedLicenses: ['GPL-3.0', 'AGPL-3.0', 'GPL-2.0', 'AGPL-1.0', 'SSPL']
     ```
   - This logic was moved entirely into `src/config/`, within the policy manager (`PolicyManager`).
2. **Automatic detection of the project license**:
   - Search for `LICENSE`, `LICENSE.md` and `LICENSE.txt` files in the root of the open folder and extract the license type automatically.

---

## 3. Reference code files organized in this folder
- `config/policyManager.ts`: Manages the policies, the allowed and prohibited licenses, and the default compatibility.
- `config/licenseDetectorWorkspace.ts`: Finds and reads the project license from the root folder.
- `config/settings.ts`: Reads the VS Code `schemaAI.*` settings and reacts to changes in them.

---

## 4. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-01-T1
   ```
2. Write the unit test first (Red Phase):
   - Test reading the default settings.
   - Test extracting the MIT license from a sample LICENSE file.
3. Move the reference code into `src/config/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
