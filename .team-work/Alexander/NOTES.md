# Task guide — Alexander (HU-07)

## 1. Scope of responsibility and folders
- **Assigned folder**: `src/search/`
- **User stories (ClickUp HUs)**:
  - **HU-07**: GitHub Code Search API client and code similarity calculation.

---

## 2. How the code was separated from the prototype (`sourceSearch.ts`)
`sourceSearch.ts` was split, as directed, into 3 independent parts:
1. **Alexander's part (`src/search/`)**:
   - Building the GitHub Code Search query and preparing the code identifiers (Identifiers).
   - Excluding the current project's repository (Self-Project Exclusion).
   - Downloading the candidate file to verify it and compare the match (Content Verification & Token Similarity >= 70%).
2. **David's part (`src/licenses/`)**: Extracting and identifying `spdx_id` license identifiers and inspecting GPL/MIT/Apache license texts.
3. **Yunus's part (`src/network/`)**: Handling errors and the 403 / 429 usage limits, and retries (Retries).

---

## 3. Reference code files organized in this folder
- `search/githubSearchClient.ts`: GitHub code search client that excludes the current project and checks the original content.
- `search/similarityCalculator.ts`: Algorithms for calculating the similarity score and filtering out common words.

---

## 4. Work plan and applying TDD (from Monday)
1. Create a task branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-07-T1
   ```
2. Write the unit test first (Red Phase):
   - Test converting code into a protocol search query.
   - Test calculating similarity above 70% and ignoring queries with too few identifiers (< 4).
   - **Warning**: Use mock responses (Mocks) to prevent internet access during testing.
3. Move the organized reference code into `src/search/` (Green Phase).
4. Run the tests:
   ```bash
   npm test
   ```
5. Open a Pull Request to `develop` and assign the reviewer from the `rev-` tag in ClickUp.
