# Sprint 1 plan — Yunus

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/network/`, `src/test/`, CI |
| Your ClickUp items | HU-10, QA·T1, QA·T4 |
| Your work | 9 h (own tasks) + 5,5 h (reviews) = **14,5 h** of 16 h capacity |
| You review | COORD (Ahmet), MET — Cumplimiento de hitos (Alexander), HU-07·T3 (Alexander), HU-08·T1 (David), HU-01·T3 (Leon), HU-01·T4 (Leon), HU-03·T1 (Yusuf), HU-03·T3 (Yusuf), HU-15·T2 (Sergio) |
| Also | Your QA·T4 (CI) is the base for everybody: it must be merged on Tue 10/11 (milestone H0). Your QA·T1 mocks unblock the rest of the team's tests. |

## How every task works (TDD, mandatory)

1. **Branch:** `feature/HU-xx-Tn` created from `develop`. One branch per task.
2. **RED:** write the test first in `src/test/<your-folder>/`. Run `npm test`: it must fail. Commit it alone as `test: HU-xx Tn ... (red)`. This commit is the TDD evidence the reviewer and the P6 metric check (≥ 90 % of PRs).
3. **GREEN:** write the minimum code in `src/<your-folder>/` to make it pass. Your `.team-work/<you>/` folder has the prototype code as **reference**: port the piece you need, never whole files. Commit `feat: ...`.
4. **REFACTOR:** clean it with the tests still green, `npm run lint`. Commit `refactor: ...` if needed.
5. **PR to `develop`:** title `HU-xx Tn: <task name>`, ClickUp link in the description. Move the ClickUp task to **EN REVISIÓN** and tell your reviewer (the `rev-*` tag on the task).
6. **Done** only when the PR is approved by the reviewer, CI is green and it is merged. Then move the task to **COMPLETADOS**. Definition of Done: P6 page 1a.

**This week's first days:** `tsconfig.json` and the CI arrive with Yunus's QA·T4 on Tue 10/11. If `npm test` cannot run on Monday, write and commit your test anyway and run it on Tuesday.

**Testing code that uses `vscode`:** plain Mocha cannot load the real `vscode` module. Pass VS Code objects in through the constructor (a `DiagnosticCollection`, `context.secrets`, a configuration object…) so the test can give a fake one. From Fri 13/11, Yunus's mocks are in `src/test/mocks/`.

**Blocked?** Try for 45 min, then move the task to **NECESITA AYUDA** in ClickUp and post `🚨 BLOQUEO: [task] - [what] - [link]` in the group. Do not wait for the next meeting.

**Daily Scrum (Mon–Fri, 15 min, Google Meet, run by Yusuf):** 90 s each. Answer with this plan in hand: (1) what I finished since the last meeting, (2) what I will have ready for the next one (the "Ready by the next meeting" line of today), (3) what blocks me (including PRs waiting for review).

**Plan vs reality:** this file is the plan. ClickUp is the truth: every task has its due date there (= the day it must be merged). If something moves, change it in ClickUp and say it in the meeting.

## Day by day

### Day 1 — Mon 9/11
*Planned: about 1,5 h.*

**[QA·T4 — GitHub Actions pipeline and .vsix packaging](https://app.clickup.com/t/1amfa05xxz6)** (1,5 h)
- Create the branch `feature/QA-T4` from `develop` (`git checkout develop && git pull && git checkout -b feature/QA-T4`).
- **SET UP:** add `tsconfig.json`, `.eslintrc`, `.prettierrc`, `package-lock.json`, `.github/workflows/ci.yml` (see the task card). Reference: (old `.github/workflows/build.yml` on the `prototype`/main branch).
- **CHECK:** add `src/test/sanity.test.ts` with one passing test, then run `npm install`, `npm run compile`, `npm run lint` and `npm test` locally: all of them must work. Commit `chore: QA T4 ...`.
- **PR:** open a pull request to `develop` titled `QA T4: GitHub Actions pipeline and .vsix packaging`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Ahmet** on WhatsApp.
- Open the PR today: everybody needs it to run `npm test`.

**Ready by the next meeting:**
- [ ] QA·T4: PR open and task in EN REVISIÓN.

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 2 h.*

**[QA·T4 — GitHub Actions pipeline and .vsix packaging](https://app.clickup.com/t/1amfa05xxz6)** (0,5 h)
- Apply Ahmet's review comments: it must be merged today (milestone H0). Then mark the CI check as required in the branch protection.

**[QA·T1 — Mocha setup and mocks of VS Code, GitHub Search API and the LLM](https://app.clickup.com/t/1amfa05xxza)** (0,5 h)
- Create the branch `feature/QA-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/QA-T1`).
- **RED:** write the tests in `src/test/mocks/mocks.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: QA T1 Mocha setup and mocks of VS Code, GitHub Search API and the LLM (red)` and push.

**Reviews today**
- COORD (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- HU-03·T1 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] QA·T4: review comments applied and merged.
- [ ] QA·T1: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 3 — Wed 11/11
*Planned: about 1,5 h.*

**[QA·T1 — Mocha setup and mocks of VS Code, GitHub Search API and the LLM](https://app.clickup.com/t/1amfa05xxza)** (1,5 h)
- **GREEN:** implement in `src/test/mocks/vscode.ts, src/test/mocks/githubApi.ts, src/test/mocks/llm.ts` only what the tests need. Use `.team-work/Yunus/test/testHarness.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: QA T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.

**Ready by the next meeting:**
- [ ] QA·T1: tests passing locally; PR ready to open.

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 1,5 h.*

**[QA·T1 — Mocha setup and mocks of VS Code, GitHub Search API and the LLM](https://app.clickup.com/t/1amfa05xxza)** (1 h)
- **PR:** open a pull request to `develop` titled `QA T1: Mocha setup and mocks of VS Code, GitHub Search API and the LLM`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Reviews today**
- HU-01·T3 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] QA·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 5 — Fri 13/11
*Planned: about 1,5 h.*

**[MET — % tests superados en CI — P5 KPI: % of tests passing in CI](https://app.clickup.com/t/1amfa05y77n)** (0,5 h)
- First measurement from the GitHub Actions runs of the week.

**Reviews today**
- HU-08·T1 (David): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- HU-01·T4 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] MET — % tests superados en CI: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1,5 h.*

**[HU-10·T1 — Detect the offline state and warn the user](https://app.clickup.com/t/1amfa05xxyz)** (1 h)
- Create the branch `feature/HU-10-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-10-T1`).
- **RED:** write the tests in `src/test/network/httpClient.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-10 T1 Detect the offline state and warn the user (red)` and push.
- **GREEN:** implement in `src/network/httpClient.ts` only what the tests need. Use `.team-work/Yunus/network/httpClient.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-10 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-10 T1: Detect the offline state and warn the user`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Ahmet** on WhatsApp (they have 24 h).

**Reviews today**
- HU-03·T3 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-10·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 7 — Tue 17/11
No planned tasks: use it to catch up, help a blocked teammate or review early.

### Day 8 — Wed 18/11
*Planned: about 1 h.*

**[HU-10·T2 — Read GitHub rate-limit headers and offer a retry](https://app.clickup.com/t/1amfa05xxyy)** (1 h)
- Create the branch `feature/HU-10-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-10-T2`).
- **RED:** write the tests in `src/test/network/rateLimitHandler.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-10 T2 Read GitHub rate-limit headers and offer a retry (red)` and push.
- Needs HU-07·T2 (merged today).

**Ready by the next meeting:**
- [ ] HU-10·T2: branch pushed with the failing tests (red).

### Day 9 — Thu 19/11
*Planned: about 1,5 h.*

**[MET — % tests superados en CI — P5 KPI: % of tests passing in CI](https://app.clickup.com/t/1amfa05y77n)** (1 h)
- Final value (runs up to today) and colour on the P5 page.

**[HU-10·T2 — Read GitHub rate-limit headers and offer a retry](https://app.clickup.com/t/1amfa05xxyy)** (0,5 h)
- **PR:** open a pull request to `develop` titled `HU-10 T2: Read GitHub rate-limit headers and offer a retry`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] MET — % tests superados en CI: value written on the P5 page and said in the meeting.
- [ ] HU-10·T2: PR open and task in EN REVISIÓN.

### Day 10 — Fri 20/11
*Planned: about 2,5 h.*

**Reviews today**
- MET — Cumplimiento de hitos (Alexander): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)
- HU-07·T3 (Alexander): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (1 h)
- HU-15·T2 (Sergio): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (1 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [QA·T4 — GitHub Actions pipeline and .vsix packaging](https://app.clickup.com/t/1amfa05xxz6)
- **Estimate:** 2 h · **Reviewer:** Ahmet · **Merged by:** Tue 10/11
- **Reference code:** (old `.github/workflows/build.yml` on the `prototype`/main branch)
- **Goes in:** `tsconfig.json, .eslintrc, .prettierrc, package-lock.json, .github/workflows/ci.yml`
- **What the tests (or the deliverable) must cover:**
  - `tsconfig.json` (rootDir `src`, outDir `out`) so `npm run compile` and `npm test` work.
  - ESLint + Prettier config and an `npm run lint` script.
  - Workflow on every PR to `develop`: `npm ci` → compile → lint → test → package `.vsix`.
  - After merging: mark the CI check as required in the branch protection.

### [QA·T1 — Mocha setup and mocks of VS Code, GitHub Search API and the LLM](https://app.clickup.com/t/1amfa05xxza)
- **Estimate:** 3 h · **Reviewer:** Alexander · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/Yunus/test/testHarness.ts`
- **Goes in:** `src/test/mocks/vscode.ts, src/test/mocks/githubApi.ts, src/test/mocks/llm.ts`
- **Tests:** `src/test/mocks/mocks.test.ts`
- **What the tests (or the deliverable) must cover:**
  - `vscode` mock: window, workspace configuration, languages, DiagnosticCollection, SecretStorage, Memento.
  - GitHub API mock with canned search and repo responses (including 403/429).
  - LLM mock with a canned answer and a timeout mode.
  - A self-test that each mock behaves as documented.

### [MET — % tests superados en CI — P5 KPI: % of tests passing in CI](https://app.clickup.com/t/1amfa05y77n)
- **Estimate:** 1,5 h · **Reviewer:** Abdul · **Due:** Fri 20/11

### [HU-10·T1 — Detect the offline state and warn the user](https://app.clickup.com/t/1amfa05xxyz)
- **Estimate:** 1 h · **Reviewer:** Ahmet · **Merged by:** Tue 17/11
- **Reference code:** `.team-work/Yunus/network/httpClient.ts`
- **Goes in:** `src/network/httpClient.ts`
- **Tests:** `src/test/network/httpClient.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A network error returns a result of type `error`, NOT "no matches" (the prototype showed it as LOW risk).
  - Offline → the user gets a warning.
  - 5xx responses are distinguished from network errors.

### [HU-10·T2 — Read GitHub rate-limit headers and offer a retry](https://app.clickup.com/t/1amfa05xxyy)
- **Estimate:** 1,5 h · **Reviewer:** Leon · **Merged by:** Fri 20/11
- **Reference code:** `.team-work/Yunus/network/rateLimitHandler.ts`
- **Goes in:** `src/network/rateLimitHandler.ts`
- **Tests:** `src/test/network/rateLimitHandler.test.ts`
- **What the tests (or the deliverable) must cover:**
  - 403 with `x-ratelimit-remaining: 0` → message with the reset time and a "Retry" option.
  - 429 → back-off and retry up to 3 times.
