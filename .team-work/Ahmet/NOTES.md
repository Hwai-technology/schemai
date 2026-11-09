# Developer Workspace: Ahmet

## Assigned Scope
- **Assigned Features**: `core/`, `analysis/`
- **Assigned HUs**: COORD, HU-05, HU-06

## Purpose of this Workspace
This `.team-work/Ahmet/` directory is your private, local-only staging and scratch area. It is explicitly ignored by Git (`.gitignore`) and will never be pushed to GitHub. Use it to experiment, prepare snippets, or draft implementation details before moving them to official feature branches.

## How to Prepare Code for Integration
1. Prototype code or ideas can be drafted and tested here locally.
2. When ready to implement a ClickUp HU, create a feature branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-xx-Tn
   ```
3. Commit your unit test first (Red phase of TDD).
4. Port or implement only the necessary code into `src/core/` or `src/analysis/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

