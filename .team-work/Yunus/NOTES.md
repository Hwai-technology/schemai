# Developer Workspace: Yunus

## Assigned Scope
- **Assigned Features**: `network/`, `test/`
- **Assigned HUs**: HU-10, QA, CI

## Purpose of this Workspace
This `.team-work/Yunus/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft resilient HTTP interceptors, rate-limiting backoff algorithms, mock test suites, and CI workflows.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-10-Tn  # or feature/CI-Tn
   ```
3. Commit your unit test first (Red phase of TDD) simulating 403, 429, and offline retry scenarios.
4. Port or implement the minimal code into `src/network/` or `src/test/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

