# Developer Workspace: Yusuf

## Assigned Scope
- **Assigned Features**: `auth/`, `security/`, `history/`
- **Assigned HUs**: HU-02, HU-03, HU-13

## Purpose of this Workspace
This `.team-work/Yusuf/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft authentication workflows, SecretStorage encryption handling, and audit record logging.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-02-Tn  # or HU-03-Tn / HU-13-Tn
   ```
3. Commit your unit test first (Red phase of TDD) validating authentication states or secure storage.
4. Port or implement the minimal code into `src/auth/`, `src/security/`, or `src/history/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

