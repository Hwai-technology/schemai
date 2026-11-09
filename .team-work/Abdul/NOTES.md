# Developer Workspace: Abdul

## Assigned Scope
- **Assigned Features**: `alerts/`
- **Assigned HUs**: HU-11, HU-12

## Purpose of this Workspace
This `.team-work/Abdul/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft diagnostic collections, hover providers, text decorations, and UI risk cards.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-11-Tn  # or feature/HU-12-Tn
   ```
3. Commit your unit test first (Red phase of TDD) validating diagnostic generation.
4. Port or implement the minimal code into `src/alerts/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

