# Sprint 1 plan — Yusuf

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/auth/`, `src/security/`, `src/history/` |
| Your ClickUp items | HU-02, HU-03, HU-13 |
| Your work | 10,5 h (own tasks) + 3,5 h (reviews) = **14 h** of 16 h capacity |
| You review | MET — % HU completadas (Ahmet), HU-11·T2 (Abdul), MET — Burndown de horas (Leon), HU-01·T5 (Leon), HU-04·T1 (Leon), HU-04·T3 (Leon), HU-14·T1 (Sergio) |
| Also | You are also the Scrum Master: run the daily Scrum Meeting (15 min, 90 s per person), keep the ClickUp board up to date and reassign reviews if one is stuck for more than 24 h. |

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
*Planned: about 1 h.*

**[HU-03·T1 — SecretStorage wrapper](https://app.clickup.com/t/1amfa05xxxr)** (1 h)
- Create the branch `feature/HU-03-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-03-T1`).
- **RED:** write the tests in `src/test/security/secretStorage.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-03 T1 SecretStorage wrapper (red)` and push.
- **GREEN:** implement in `src/security/secretStorage.ts` only what the tests need. Use `.team-work/Yusuf/security/secretStorage.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-03 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-03 T1: SecretStorage wrapper`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-03·T1: PR open and task in EN REVISIÓN.

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1,5 h.*

**[HU-02·T1 — AuthManager with VS Code's GitHub authentication](https://app.clickup.com/t/1amfa05xxxp)** (1,5 h)
- Create the branch `feature/HU-02-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-02-T1`).
- **RED:** write the tests in `src/test/auth/authManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-02 T1 AuthManager with VS Code's GitHub authentication (red)` and push.
- **GREEN:** implement in `src/auth/authManager.ts` only what the tests need. Use `.team-work/Yusuf/auth/authManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-02 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-02 T1: AuthManager with VS Code's GitHub authentication`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-02·T1: PR open and task in EN REVISIÓN.

### Day 3 — Wed 11/11
*Planned: about 2 h.*

**[HU-02·T2 — Sign-in and sign-out commands](https://app.clickup.com/t/1amfa05xxxt)** (0,5 h)
- Create the branch `feature/HU-02-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-02-T2`).
- **RED:** write the tests in `src/test/auth/commands.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-02 T2 Sign-in and sign-out commands (red)` and push.
- **GREEN:** implement in `src/auth/commands.ts` only what the tests need. Use `.team-work/Yusuf/auth/authManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-02 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-02 T2: Sign-in and sign-out commands`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**[HU-03·T2 — Store and retrieve the GitHub and LLM tokens](https://app.clickup.com/t/1amfa05xxxx)** (1 h)
- Create the branch `feature/HU-03-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-03-T2`).
- **RED:** write the tests in `src/test/security/tokens.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-03 T2 Store and retrieve the GitHub and LLM tokens (red)` and push.
- **GREEN:** implement in `src/security/tokens.ts` only what the tests need. Use `.team-work/Yusuf/security/secretStorage.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-03 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-03 T2: Store and retrieve the GitHub and LLM tokens`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Sergio** on WhatsApp (they have 24 h).

**Reviews today**
- HU-14·T1 (Sergio): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-02·T2: PR open and task in EN REVISIÓN.
- [ ] HU-03·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 1,5 h.*

**[HU-02·T3 — Session status in the status bar](https://app.clickup.com/t/1amfa05xxxm)** (1 h)
- Create the branch `feature/HU-02-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-02-T3`).
- **RED:** write the tests in `src/test/auth/authStatusBar.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-02 T3 Session status in the status bar (red)` and push.
- **GREEN:** implement in `src/auth/authStatusBar.ts` only what the tests need. Use `.team-work/Yusuf/auth/authStatusBar.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-02 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-02 T3: Session status in the status bar`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**[HU-02·T4 — Warn if there is no session before analysing](https://app.clickup.com/t/1amfa05xxxn)** (0,5 h)
- Create the branch `feature/HU-02-T4` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-02-T4`).
- **RED:** write the tests in `src/test/auth/authManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-02 T4 Warn if there is no session before analysing (red)` and push.
- **GREEN:** implement in `src/auth/authManager.ts` only what the tests need. Use `.team-work/Yusuf/auth/authManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-02 T4 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-02 T4: Warn if there is no session before analysing`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Sergio** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-02·T3: PR open and task in EN REVISIÓN.
- [ ] HU-02·T4: PR open and task in EN REVISIÓN.

### Day 5 — Fri 13/11
*Planned: about 1,5 h.*

**[HU-03·T3 — Check that no token appears in settings, logs or commits](https://app.clickup.com/t/1amfa05xxxy)** (0,5 h)
- Create the branch `feature/HU-03-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-03-T3`).
- **RED:** write the tests in `src/test/security/noTokenLeak.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-03 T3 Check that no token appears in settings, logs or commits (red)` and push.
- **GREEN:** implement in `(test only)` only what the tests need. Use — as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-03 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-03 T3: Check that no token appears in settings, logs or commits`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**[MET — Tiempo bloqueada — P5 KPI: time blocked](https://app.clickup.com/t/1amfa05y796)** (0,5 h)
- First measurement: time tasks spent in NECESITA AYUDA this week.

**Reviews today**
- HU-11·T2 (Abdul): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-03·T3: PR open and task in EN REVISIÓN.
- [ ] MET — Tiempo bloqueada: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1,5 h.*

**[HU-13·T1 — Mark an alert as reviewed or false positive](https://app.clickup.com/t/1amfa05xxyv)** (1 h)
- Create the branch `feature/HU-13-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-13-T1`).
- **RED:** write the tests in `src/test/history/historyManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-13 T1 Mark an alert as reviewed or false positive (red)` and push.
- Needs HU-11·T1 (merged last Thursday).

**Reviews today**
- HU-01·T5 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-13·T1: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 7 — Tue 17/11
*Planned: about 1 h.*

**[HU-13·T1 — Mark an alert as reviewed or false positive](https://app.clickup.com/t/1amfa05xxyv)** (0,5 h)
- **PR:** open a pull request to `develop` titled `HU-13 T1: Mark an alert as reviewed or false positive`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**Reviews today**
- HU-04·T1 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-13·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 8 — Wed 18/11
*Planned: about 1 h.*

**[HU-13·T2 — List and restore ignored alerts](https://app.clickup.com/t/1amfa05xxyn)** (1 h)
- Create the branch `feature/HU-13-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-13-T2`).
- **RED:** write the tests in `src/test/history/historyManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-13 T2 List and restore ignored alerts (red)` and push.

**Ready by the next meeting:**
- [ ] HU-13·T2: branch pushed with the failing tests (red).

### Day 9 — Thu 19/11
*Planned: about 1 h.*

**[HU-13·T2 — List and restore ignored alerts](https://app.clickup.com/t/1amfa05xxyn)** (0,5 h)
- **PR:** open a pull request to `develop` titled `HU-13 T2: List and restore ignored alerts`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**Reviews today**
- HU-04·T3 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-13·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 10 — Fri 20/11
*Planned: about 2 h.*

**[MET — Tiempo bloqueada — P5 KPI: time blocked](https://app.clickup.com/t/1amfa05y796)** (1 h)
- Final value and colour on the P5 page.

**Reviews today**
- MET — % HU completadas (Ahmet): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)
- MET — Burndown de horas (Leon): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Tiempo bloqueada: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [HU-03·T1 — SecretStorage wrapper](https://app.clickup.com/t/1amfa05xxxr)
- **Estimate:** 1 h · **Reviewer:** Yunus · **Merged by:** Tue 10/11
- **Reference code:** `.team-work/Yusuf/security/secretStorage.ts`
- **Goes in:** `src/security/secretStorage.ts`
- **Tests:** `src/test/security/secretStorage.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Inject a fake `context.secrets`: store, get and delete a token.
  - An empty token is rejected.

### [HU-02·T1 — AuthManager with VS Code's GitHub authentication](https://app.clickup.com/t/1amfa05xxxp)
- **Estimate:** 1,5 h · **Reviewer:** Alexander · **Merged by:** Wed 11/11
- **Reference code:** `.team-work/Yusuf/auth/authManager.ts`
- **Goes in:** `src/auth/authManager.ts`
- **Tests:** `src/test/auth/authManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - With a fake `vscode.authentication`: an existing session returns its token.
  - No session → `undefined`, without prompting the user.
  - The token is never written to settings.

### [HU-02·T2 — Sign-in and sign-out commands](https://app.clickup.com/t/1amfa05xxxt)
- **Estimate:** 0,5 h · **Reviewer:** Abdul · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Yusuf/auth/authManager.ts`
- **Goes in:** `src/auth/commands.ts`
- **Tests:** `src/test/auth/commands.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Sign-in calls `getSession` with `createIfNone: true`.
  - Sign-out clears the session.

### [HU-03·T2 — Store and retrieve the GitHub and LLM tokens](https://app.clickup.com/t/1amfa05xxxx)
- **Estimate:** 1 h · **Reviewer:** Sergio · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Yusuf/security/secretStorage.ts`
- **Goes in:** `src/security/tokens.ts`
- **Tests:** `src/test/security/tokens.test.ts`
- **What the tests (or the deliverable) must cover:**
  - GitHub and LLM tokens are stored under different keys.
  - The old plain-text setting `schemaAI.githubToken` is migrated to SecretStorage and removed.

### [HU-02·T3 — Session status in the status bar](https://app.clickup.com/t/1amfa05xxxm)
- **Estimate:** 1 h · **Reviewer:** Abdul · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/Yusuf/auth/authStatusBar.ts`
- **Goes in:** `src/auth/authStatusBar.ts`
- **Tests:** `src/test/auth/authStatusBar.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Shows "GitHub: connected" / "GitHub: not connected".
  - Updates when the session changes.

### [HU-02·T4 — Warn if there is no session before analysing](https://app.clickup.com/t/1amfa05xxxn)
- **Estimate:** 0,5 h · **Reviewer:** Sergio · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/Yusuf/auth/authManager.ts`
- **Goes in:** `src/auth/authManager.ts`
- **Tests:** `src/test/auth/authManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Without a session, the analysis shows a warning with a "Sign in" button and does not search.

### [HU-03·T3 — Check that no token appears in settings, logs or commits](https://app.clickup.com/t/1amfa05xxxy)
- **Estimate:** 0,5 h · **Reviewer:** Yunus · **Merged by:** Mon 16/11
- **Goes in:** (test only)
- **Tests:** `src/test/security/noTokenLeak.test.ts`
- **What the tests (or the deliverable) must cover:**
  - After storing a token, settings and the output channel contain no `ghp_`/`gho_` pattern.

### [MET — Tiempo bloqueada — P5 KPI: time blocked](https://app.clickup.com/t/1amfa05y796)
- **Estimate:** 1,5 h · **Reviewer:** Sergio · **Due:** Fri 20/11

### [HU-13·T1 — Mark an alert as reviewed or false positive](https://app.clickup.com/t/1amfa05xxyv)
- **Estimate:** 1,5 h · **Reviewer:** Abdul · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/Yusuf/history/historyManager.ts`, `.team-work/Yusuf/history/historyStorage.ts`
- **Goes in:** `src/history/historyManager.ts, src/history/historyStorage.ts`
- **Tests:** `src/test/history/historyManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Marking an alert as false positive stores it in workspaceState (fake memento).
  - The diagnostic is removed through the alerts API (`src/alerts/`).
  - The "reviewed" flag is persisted.

### [HU-13·T2 — List and restore ignored alerts](https://app.clickup.com/t/1amfa05xxyn)
- **Estimate:** 1,5 h · **Reviewer:** Leon · **Merged by:** Fri 20/11
- **Reference code:** `.team-work/Yusuf/history/historyManager.ts`
- **Goes in:** `src/history/historyManager.ts`
- **Tests:** `src/test/history/historyManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Ignored alerts can be listed.
  - Restoring one makes its diagnostic appear again.
