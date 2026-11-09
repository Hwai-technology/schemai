# Developer Workspace: David

## Assigned Scope
- **Assigned Features**: `licenses/`
- **Assigned HUs**: HU-08, HU-09

## Purpose of this Workspace
This `.team-work/David/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to develop and test license compatibility matrices, SPDX parsing logic, and risk classification rules.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-08-Tn  # or feature/HU-09-Tn
   ```
3. Commit your unit test first (Red phase of TDD) validating license matrix outcomes.
4. Port or implement the minimal code into `src/licenses/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

