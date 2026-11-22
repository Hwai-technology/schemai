# Task guide — Yunus (HU-10, QA, CI)

## 1. Scope of responsibility and folders
- **Assigned folders**: `src/network/` and `src/test/`
- **User stories (ClickUp HUs)**:
  - **HU-10**: Network resilience, usage limits (403 and 429), and automatic retry (Exponential Backoff).
  - **QA & CI**: Shared test structure, unit tests, and automated verification settings in GitHub Actions.

---

## 2. How the code was separated from the prototype (`sourceSearch.ts`)
The network logic was extracted from `sourceSearch.ts`:
1. **Handling the Rate Limit (403 / 429)**:
   - Extracting the check for `status === 403 || status === 429`.
   - Alerting the user when the anonymous quota is exhausted and encouraging them to sign in with their personal account.
2. **Custom HTTP client (`HttpClient`)**:
   - Sending GET requests with a Timeout and error handling.
   - Supporting Exponential Backoff on temporary failures.
3. **Test frameworks and CI**:
   - Providing a Mock environment for fast tests with no real internet connection.

---

## 3. Reference code files organized in this folder
- `network/httpClient.ts`: Flexible HTTP client with timeout support and automatic conversion of JSON and text data.
- `network/rateLimitHandler.ts`: Monitors the 403 and 429 response codes and handles cooldown periods (Cooldown).
- `test/testHarness.ts`: Shared structure and helpers for running Mocha tests and simulating the VS Code environment.

---

## 4. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-10-T1  # or feature/CI-T1
   ```
2. Write the unit test first (Red Phase):
   - Test intercepting the 429 error and raising the appropriate warning.
   - Test handling a Timeout and returning null without crashing the extension.
3. Move the reference code into `src/network/` and `src/test/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
