# Developer Workspace: Sergio

## Assigned Scope
- **Assigned Features**: `llm/`, `quickfix/`
- **Assigned HUs**: HU-14, HU-15

## Purpose of this Workspace
This `.team-work/Sergio/` directory is your private, local-only workspace. It is git-ignored and will not be pushed to GitHub. Use it to draft prompt templates, LLM client reasoning, and CodeActionProvider remediation edits.

## How to Prepare Code for Integration
1. Prototype code or ideas can be staged and tested here locally.
2. When starting a ClickUp HU, branch off `ddevelop`:
   ```bash
   git checkout -b feature/HU-14-Tn  # or feature/HU-15-Tn
   ```
3. Commit your unit test first (Red phase of TDD) validating prompt generation or code action registration.
4. Port or implement the minimal code into `src/llm/` or `src/quickfix/` (Green phase).
5. Ensure tests pass cleanly:
   ```bash
   npm test
   ```
6. Open a Pull Request targeting `ddevelop`.
7. Obtain review approval from the designated reviewer (`rev-` tag in ClickUp).

