# Sprint 1 plan — Leon

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/config/` |
| Your ClickUp items | HU-01, HU-04, QA·T3 |
| Your work | 11 h (own tasks) + 3,5 h (reviews) = **14,5 h** of 16 h capacity |
| You review | HU-06·T2 (Ahmet), HU-09·T2 (David), HU-08·T2 (David), QA·T2 (David), MET — Clasificación y revisión del Doc P5 (Abdul), HU-13·T2 (Yusuf), HU-10·T2 (Yunus) |

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

**[HU-01·T1 — Declare the project license setting in package.json](https://app.clickup.com/t/1amfa05xxxq)** (0,5 h)
- Create the branch `feature/HU-01-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-01-T1`).
- **RED:** write the tests in `src/test/config/settings.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-01 T1 Declare the project license setting in package.json (red)` and push.
- **GREEN:** implement in `package.json (`schemaAI.projectLicense`) + src/config/settings.ts` only what the tests need. Use `.team-work/Leon/config/settings.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-01 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-01 T1: Declare the project license setting in package.json`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **David** on WhatsApp (they have 24 h).

**[MET — Burndown de horas — P5 KPI 2: hours burndown](https://app.clickup.com/t/1amfa05z5m1)** (0,5 h)
- Set up the burndown (Sprint Reporting in ClickUp) and write the starting point: 82.8 h.

**Ready by the next meeting:**
- [ ] HU-01·T1: PR open and task in EN REVISIÓN.
- [ ] MET — Burndown de horas: value written on the P5 page and said in the meeting.

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1 h.*

**[HU-01·T2 — Define the SPDX catalogue and its types](https://app.clickup.com/t/1amfa05xxxk)** (1 h)
- Create the branch `feature/HU-01-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-01-T2`).
- **RED:** write the tests in `src/test/config/spdx.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-01 T2 Define the SPDX catalogue and its types (red)` and push.
- **GREEN:** implement in `src/config/spdx.ts` only what the tests need. Use `.team-work/Leon/config/policyManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-01 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-01 T2: Define the SPDX catalogue and its types`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **David** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-01·T2: PR open and task in EN REVISIÓN.

### Day 3 — Wed 11/11
*Planned: about 1,5 h.*

**[HU-01·T3 — ConfigManager to read and save the license and policy](https://app.clickup.com/t/1amfa05xxxv)** (1,5 h)
- Create the branch `feature/HU-01-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-01-T3`).
- **RED:** write the tests in `src/test/config/configManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-01 T3 ConfigManager to read and save the license and policy (red)` and push.
- **GREEN:** implement in `src/config/configManager.ts` only what the tests need. Use `.team-work/Leon/config/policyManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-01 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-01 T3: ConfigManager to read and save the license and policy`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-01·T3: PR open and task in EN REVISIÓN.

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 1 h.*

**[HU-01·T4 — Detect the LICENSE file and propose the license](https://app.clickup.com/t/1amfa05xxxw)** (1 h)
- Create the branch `feature/HU-01-T4` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-01-T4`).
- **RED:** write the tests in `src/test/config/workspaceLicense.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-01 T4 Detect the LICENSE file and propose the license (red)` and push.
- **GREEN:** implement in `src/config/workspaceLicense.ts` only what the tests need. Use `.team-work/Leon/config/licenseDetectorWorkspace.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-01 T4 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-01 T4: Detect the LICENSE file and propose the license`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-01·T4: PR open and task in EN REVISIÓN.

### Day 5 — Fri 13/11
*Planned: about 1,5 h.*

**[MET — Burndown de horas — P5 KPI 2: hours burndown](https://app.clickup.com/t/1amfa05z5m1)** (0,5 h)
- Weekly point: remaining hours vs ideal line (ideal starts on 9/11, see P5 note).

**[HU-01·T5 — Persist the configuration between VS Code sessions](https://app.clickup.com/t/1amfa05xxxu)** (0,5 h)
- Create the branch `feature/HU-01-T5` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-01-T5`).
- **RED:** write the tests in `src/test/config/configManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-01 T5 Persist the configuration between VS Code sessions (red)` and push.
- **GREEN:** implement in `src/config/configManager.ts` only what the tests need. Use `.team-work/Leon/config/settings.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-01 T5 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-01 T5: Persist the configuration between VS Code sessions`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yusuf** on WhatsApp (they have 24 h).

**Reviews today**
- HU-06·T2 (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] MET — Burndown de horas: value written on the P5 page and said in the meeting.
- [ ] HU-01·T5: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1 h.*

**[HU-04·T1 — Setting to enable / disable automatic analysis](https://app.clickup.com/t/1amfa05xxyj)** (1 h)
- Create the branch `feature/HU-04-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-04-T1`).
- **RED:** write the tests in `src/test/config/settings.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-04 T1 Setting to enable / disable automatic analysis (red)` and push.
- **GREEN:** implement in `package.json + src/config/settings.ts` only what the tests need. Use `.team-work/Leon/config/settings.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-04 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-04 T1: Setting to enable / disable automatic analysis`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yusuf** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-04·T1: PR open and task in EN REVISIÓN.

### Day 7 — Tue 17/11
*Planned: about 1 h.*

**[HU-04·T2 — Similarity threshold and minimum fragment size settings](https://app.clickup.com/t/1amfa05xxyk)** (1 h)
- Create the branch `feature/HU-04-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-04-T2`).
- **RED:** write the tests in `src/test/config/settings.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-04 T2 Similarity threshold and minimum fragment size settings (red)` and push.
- **GREEN:** implement in `package.json + src/config/settings.ts` only what the tests need. Use `.team-work/Leon/config/settings.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-04 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-04 T2: Similarity threshold and minimum fragment size settings`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Ahmet** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-04·T2: PR open and task in EN REVISIÓN.

### Day 8 — Wed 18/11
*Planned: about 1,5 h.*

**[HU-04·T3 — Apply configuration changes without restarting VS Code](https://app.clickup.com/t/1amfa05xxyh)** (1 h)
- Create the branch `feature/HU-04-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-04-T3`).
- **RED:** write the tests in `src/test/config/settings.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-04 T3 Apply configuration changes without restarting VS Code (red)` and push.
- **GREEN:** implement in `src/config/settings.ts` only what the tests need. Use `.team-work/Leon/config/settings.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-04 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-04 T3: Apply configuration changes without restarting VS Code`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yusuf** on WhatsApp (they have 24 h).

**Reviews today**
- HU-09·T2 (David): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-04·T3: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 9 — Thu 19/11
*Planned: about 1,5 h.*

**[QA·T3 — Performance benchmark (15 s or less) and check that no secrets leak](https://app.clickup.com/t/1amfa05xxz3)** (1 h)
- Create the branch `feature/QA-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/QA-T3`).
- **RED:** write the tests in `src/test/performance/benchmark.test.ts, src/test/performance/secrets.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: QA T3 Performance benchmark (red)` and push.

**Reviews today**
- HU-08·T2 (David): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] QA·T3: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 10 — Fri 20/11
*Planned: about 3,5 h.*

**[MET — Burndown de horas — P5 KPI 2: hours burndown](https://app.clickup.com/t/1amfa05z5m1)** (0,5 h)
- Final point and comment on P5 page 2.

**[QA·T3 — Performance benchmark (15 s or less) and check that no secrets leak](https://app.clickup.com/t/1amfa05xxz3)** (1 h)
- **PR:** open a pull request to `develop` titled `QA T3: Performance benchmark (15 s or less) and check that no secrets leak`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Reviews today**
- QA·T2 (David): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- MET — Clasificación y revisión del Doc P5 (Abdul): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)
- HU-13·T2 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- HU-10·T2 (Yunus): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Burndown de horas: value written on the P5 page and said in the meeting.
- [ ] QA·T3: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [HU-01·T1 — Declare the project license setting in package.json](https://app.clickup.com/t/1amfa05xxxq)
- **Estimate:** 0,5 h · **Reviewer:** David · **Merged by:** Tue 10/11
- **Reference code:** `.team-work/Leon/config/settings.ts`
- **Goes in:** `package.json (`schemaAI.projectLicense`) + src/config/settings.ts`
- **Tests:** `src/test/config/settings.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The setting exists with default `MIT`.
  - Reading it with a fake configuration returns the value.

### [MET — Burndown de horas — P5 KPI 2: hours burndown](https://app.clickup.com/t/1amfa05z5m1)
- **Estimate:** 1,5 h · **Reviewer:** Yusuf · **Due:** Fri 20/11

### [HU-01·T2 — Define the SPDX catalogue and its types](https://app.clickup.com/t/1amfa05xxxk)
- **Estimate:** 1 h · **Reviewer:** David · **Merged by:** Wed 11/11
- **Reference code:** `.team-work/Leon/config/policyManager.ts`
- **Goes in:** `src/config/spdx.ts`
- **Tests:** `src/test/config/spdx.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The catalogue contains MIT, Apache-2.0, BSD-2/3-Clause, ISC, GPL-2.0, GPL-3.0, AGPL-3.0, LGPL-3.0, MPL-2.0.
  - An invalid id is rejected.

### [HU-01·T3 — ConfigManager to read and save the license and policy](https://app.clickup.com/t/1amfa05xxxv)
- **Estimate:** 1,5 h · **Reviewer:** Yunus · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Leon/config/policyManager.ts`
- **Goes in:** `src/config/configManager.ts`
- **Tests:** `src/test/config/configManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Reads the project license and the allowed / restricted lists from settings (fake configuration).
  - Uses defaults when a value is missing.
  - Moves the policy that was hard-coded in the prototype into `src/config/`.

### [HU-01·T4 — Detect the LICENSE file and propose the license](https://app.clickup.com/t/1amfa05xxxw)
- **Estimate:** 1 h · **Reviewer:** Yunus · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/Leon/config/licenseDetectorWorkspace.ts`
- **Goes in:** `src/config/workspaceLicense.ts`
- **Tests:** `src/test/config/workspaceLicense.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A LICENSE file with the MIT text → `MIT`.
  - No LICENSE file → `undefined`.
  - The detected license is proposed to the user, not applied silently.

### [HU-01·T5 — Persist the configuration between VS Code sessions](https://app.clickup.com/t/1amfa05xxxu)
- **Estimate:** 0,5 h · **Reviewer:** Yusuf · **Merged by:** Mon 16/11
- **Reference code:** `.team-work/Leon/config/settings.ts`
- **Goes in:** `src/config/configManager.ts`
- **Tests:** `src/test/config/configManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A value saved to workspace settings is read back after a reload (fake configuration).

### [HU-04·T1 — Setting to enable / disable automatic analysis](https://app.clickup.com/t/1amfa05xxyj)
- **Estimate:** 1 h · **Reviewer:** Yusuf · **Merged by:** Tue 17/11
- **Reference code:** `.team-work/Leon/config/settings.ts`
- **Goes in:** `package.json + src/config/settings.ts`
- **Tests:** `src/test/config/settings.test.ts`
- **What the tests (or the deliverable) must cover:**
  - `schemaAI.autoAnalyze` exists (default true).
  - When false, the paste monitor is told not to analyse.

### [HU-04·T2 — Similarity threshold and minimum fragment size settings](https://app.clickup.com/t/1amfa05xxyk)
- **Estimate:** 1 h · **Reviewer:** Ahmet · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/Leon/config/settings.ts`
- **Goes in:** `package.json + src/config/settings.ts`
- **Tests:** `src/test/config/settings.test.ts`
- **What the tests (or the deliverable) must cover:**
  - `similarityThreshold` (0–1) and `minFragmentLines` exist with defaults.
  - Out-of-range values are clamped.

### [HU-04·T3 — Apply configuration changes without restarting VS Code](https://app.clickup.com/t/1amfa05xxyh)
- **Estimate:** 1 h · **Reviewer:** Yusuf · **Merged by:** Thu 19/11
- **Reference code:** `.team-work/Leon/config/settings.ts`
- **Goes in:** `src/config/settings.ts`
- **Tests:** `src/test/config/settings.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Firing `onDidChangeConfiguration` for `schemaAI` reloads the values.
  - Other extensions' changes are ignored.

### [QA·T3 — Performance benchmark (15 s or less) and check that no secrets leak](https://app.clickup.com/t/1amfa05xxz3)
- **Estimate:** 2 h · **Reviewer:** Alexander · **Merged by:** Fri 20/11
- **Goes in:** `src/test/performance/`
- **Tests:** `src/test/performance/benchmark.test.ts, src/test/performance/secrets.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Analysing a 30-line fragment with the mocked APIs takes 15 s or less.
  - No token appears in settings or in the log output.
