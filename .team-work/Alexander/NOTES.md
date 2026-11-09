# Developer Workspace: Alexander

## Assigned Scope
- **Assigned Features**: `search/`
- **Assigned HUs**: HU-07

## Purpose of this Workspace
This `.team-work/Alexander/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft GitHub Search API queries, test similarity heuristics, and refine models locally.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-07-Tn
   ```
3. Commit your unit test first (Red phase of TDD) with mocked network responses.
4. Port or implement the minimal code into `src/search/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

