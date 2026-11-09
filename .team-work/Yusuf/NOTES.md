# Task guide — Yusuf (HU-02, HU-03, HU-13)

## 1. Scope of responsibility and folders
- **Assigned folders**: `src/auth/`, `src/security/`, `src/history/`
- **User stories (ClickUp HUs)**:
  - **HU-02**: GitHub authentication through the VS Code Authentication API and a status bar indicator (`AuthManager`, `AuthStatusBarItem`).
  - **HU-03**: Secure storage of keys and tokens through `ExtensionContext.secrets` and migration of plain-text tokens (`SecretStorageManager`).
  - **HU-13**: Local audit log of operations and paste tracking (`HistoryManager`, `HistoryStorage`).

---

## 2. Scope limits and Sprint 1 guidance
- **Important notice (team instructions)**: The interactive sidebar panel and the full history (HU-16) stay in the prototype only and are not part of Sprint 1.
- The focus in `src/history/` is on storing and retrieving verification records locally, identifying false positives (False Positives) and setting the review mark (Reviewed).

---

## 3. Reference code files organized in this folder
- `auth/authManager.ts`: Manages GitHub sessions, signing in and out, and switching accounts.
- `auth/authStatusBar.ts`: Status bar item showing the account status and the pop-up menu.
- `security/secretStorage.ts`: Encrypted storage of tokens in the operating system and migration of old tokens.
- `history/historyManager.ts`: Records operations and review marks.
- `history/historyStorage.ts`: Circular storage limited to 150 items in `workspaceState`.

---

## 4. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-02-T1  # or HU-03 or HU-13
   ```
2. Write the unit test first (Red Phase):
   - Test saving and retrieving the secret token from `SecretStorage`.
   - Test adding audit records and confirm the record cap of 150 is enforced.
3. Move the reference code into the target folders (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
