# Developer Workspace: Leon

## Assigned Scope
- **Assigned Features**: `config/`
- **Assigned HUs**: HU-01, HU-04

## Purpose of this Workspace
This `.team-work/Leon/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft configuration listeners, LICENSE file autodetection, and policy resolution models.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-01-Tn  # or feature/HU-04-Tn
   ```
3. Commit your unit test first (Red phase of TDD) validating config reading and file detection.
4. Port or implement the minimal code into `src/config/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

