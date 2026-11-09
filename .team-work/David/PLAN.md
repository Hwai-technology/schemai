# Sprint 1 plan — David

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/licenses/` |
| Your ClickUp items | HU-08, HU-09, QA·T2 |
| Your work | 11 h (own tasks) + 3 h (reviews) = **14 h** of 16 h capacity |
| You review | HU-12·T2 (Abdul), HU-01·T1 (Leon), HU-01·T2 (Leon), HU-14·T2 (Sergio), HU-14·T3 (Sergio) |

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

**[HU-09·T1 — Define the license compatibility matrix](https://app.clickup.com/t/1amfa05xxyp)** (1 h)
- Create the branch `feature/HU-09-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-09-T1`).
- **RED:** write the tests in `src/test/licenses/compatibilityMatrix.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-09 T1 Define the license compatibility matrix (red)` and push.

**Ready by the next meeting:**
- [ ] HU-09·T1: branch pushed with the failing tests (red).

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1,5 h.*

**[HU-09·T1 — Define the license compatibility matrix](https://app.clickup.com/t/1amfa05xxyp)** (1 h)
- **GREEN:** implement in `src/licenses/compatibilityMatrix.ts` only what the tests need. Use `.team-work/David/licenses/compatibilityMatrix.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-09 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-09 T1: Define the license compatibility matrix`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Sergio** on WhatsApp (they have 24 h).

**Reviews today**
- HU-01·T1 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-09·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 3 — Wed 11/11
*Planned: about 1 h.*

**[HU-08·T1 — Create LicenseDetector with the SPDX catalogue](https://app.clickup.com/t/1amfa05xxyq)** (0,5 h)
- Create the branch `feature/HU-08-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-08-T1`).
- **RED:** write the tests in `src/test/licenses/licenseDetector.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-08 T1 Create LicenseDetector with the SPDX catalogue (red)` and push.

**Reviews today**
- HU-01·T2 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-08·T1: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 2 h.*

**[HU-08·T1 — Create LicenseDetector with the SPDX catalogue](https://app.clickup.com/t/1amfa05xxyq)** (1,5 h)
- **GREEN:** implement in `src/licenses/licenseDetector.ts` only what the tests need. Use `.team-work/David/licenses/licenseDetector.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-08 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-08 T1: Create LicenseDetector with the SPDX catalogue`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**Reviews today**
- HU-14·T2 (Sergio): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-08·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 5 — Fri 13/11
*Planned: about 0,5 h.*

**[MET — Desviación de esfuerzo — P5 KPI 3: effort deviation](https://app.clickup.com/t/1amfa05y78q)** (0,5 h)
- First measurement over the tasks completed this week: (real − estimated) / estimated. Remind everyone to log their time in ClickUp.

**Ready by the next meeting:**
- [ ] MET — Desviación de esfuerzo: value written on the P5 page and said in the meeting.

### Day 6 — Mon 16/11
*Planned: about 1,5 h.*

**[HU-09·T2 — Extend RiskEngine with classification, reason and legal notice](https://app.clickup.com/t/1amfa05xxyr)** (1 h)
- Create the branch `feature/HU-09-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-09-T2`).
- **RED:** write the tests in `src/test/licenses/riskEngine.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-09 T2 Extend RiskEngine with classification, reason and legal notice (red)` and push.
- Needs HU-08·T1 and HU-09·T1 merged (both done last week).

**Reviews today**
- HU-14·T3 (Sergio): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-09·T2: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 7 — Tue 17/11
*Planned: about 1,5 h.*

**[HU-09·T2 — Extend RiskEngine with classification, reason and legal notice](https://app.clickup.com/t/1amfa05xxyr)** (1 h)
- **GREEN:** implement in `src/licenses/riskEngine.ts` only what the tests need. Use `.team-work/David/licenses/riskEngine.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-09 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-09 T2: Extend RiskEngine with classification, reason and legal notice`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**[HU-08·T2 — Handle repositories without a license and measure the hit rate](https://app.clickup.com/t/1amfa05xxyt)** (0,5 h)
- Create the branch `feature/HU-08-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-08-T2`).
- **RED:** write the tests in `src/test/licenses/licenseDetector.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-08 T2 Handle repositories without a license and measure the hit rate (red)` and push.

**Ready by the next meeting:**
- [ ] HU-09·T2: PR open and task in EN REVISIÓN.
- [ ] HU-08·T2: branch pushed with the failing tests (red).

### Day 8 — Wed 18/11
*Planned: about 1,5 h.*

**[HU-08·T2 — Handle repositories without a license and measure the hit rate](https://app.clickup.com/t/1amfa05xxyt)** (1,5 h)
- **GREEN:** implement in `src/licenses/licenseDetector.ts` only what the tests need. Use `.team-work/David/licenses/licenseDetector.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-08 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-08 T2: Handle repositories without a license and measure the hit rate`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-08·T2: PR open and task in EN REVISIÓN.

### Day 9 — Thu 19/11
*Planned: about 2,5 h.*

**[QA·T2 — LicenseDetector accuracy tests (over 90 %)](https://app.clickup.com/t/1amfa05xxz2)** (1,5 h)
- Create the branch `feature/QA-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/QA-T2`).
- **RED:** write the tests in `src/test/licenses/accuracy.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: QA T2 LicenseDetector accuracy tests (red)` and push.
- Build the fixtures and the accuracy test.

**Reviews today**
- HU-12·T2 (Abdul): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (1 h)

**Ready by the next meeting:**
- [ ] QA·T2: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 10 — Fri 20/11
*Planned: about 1 h.*

**[MET — Desviación de esfuerzo — P5 KPI 3: effort deviation](https://app.clickup.com/t/1amfa05y78q)** (0,5 h)
- Final value and colour on P5 page 3.

**[QA·T2 — LicenseDetector accuracy tests (over 90 %)](https://app.clickup.com/t/1amfa05xxz2)** (0,5 h)
- **PR:** open a pull request to `develop` titled `QA T2: LicenseDetector accuracy tests (over 90 %)`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Desviación de esfuerzo: value written on the P5 page and said in the meeting.
- [ ] QA·T2: PR open and task in EN REVISIÓN.

## Task cards

### [HU-09·T1 — Define the license compatibility matrix](https://app.clickup.com/t/1amfa05xxyp)
- **Estimate:** 2 h · **Reviewer:** Sergio · **Merged by:** Wed 11/11
- **Reference code:** `.team-work/David/licenses/compatibilityMatrix.ts`
- **Goes in:** `src/licenses/compatibilityMatrix.ts`
- **Tests:** `src/test/licenses/compatibilityMatrix.test.ts`
- **What the tests (or the deliverable) must cover:**
  - MIT code into an MIT project → compatible.
  - GPL-3.0 code into an MIT project → incompatible (high risk).
  - GPL-3.0 code into a GPL-3.0 project → compatible.
  - An unknown license → needs manual review.

### [HU-08·T1 — Create LicenseDetector with the SPDX catalogue](https://app.clickup.com/t/1amfa05xxyq)
- **Estimate:** 2 h · **Reviewer:** Yunus · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/David/licenses/licenseDetector.ts`
- **Goes in:** `src/licenses/licenseDetector.ts`
- **Tests:** `src/test/licenses/licenseDetector.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Repository with `license.spdx_id = 'MIT'` → `'MIT'`.
  - Repository with `license: null` → `'NONE'`.
  - `'NOASSERTION'` is treated as `'NONE'`.
  - This is exactly the TDD example of P6 page 3, so follow it step by step.

### [MET — Desviación de esfuerzo — P5 KPI 3: effort deviation](https://app.clickup.com/t/1amfa05y78q)
- **Estimate:** 1 h · **Reviewer:** Sergio · **Due:** Fri 20/11

### [HU-09·T2 — Extend RiskEngine with classification, reason and legal notice](https://app.clickup.com/t/1amfa05xxyr)
- **Estimate:** 2 h · **Reviewer:** Leon · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/David/licenses/riskEngine.ts`
- **Goes in:** `src/licenses/riskEngine.ts`
- **Tests:** `src/test/licenses/riskEngine.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The project policy is injected (comes from `src/config/`, not read directly).
  - GPL-3.0 match in an MIT project → high, with a reason.
  - GPL-3.0 match in a GPL-3.0 project → low.
  - Every result includes the legal notice text.

### [HU-08·T2 — Handle repositories without a license and measure the hit rate](https://app.clickup.com/t/1amfa05xxyt)
- **Estimate:** 2 h · **Reviewer:** Leon · **Merged by:** Thu 19/11
- **Reference code:** `.team-work/David/licenses/licenseDetector.ts`
- **Goes in:** `src/licenses/licenseDetector.ts`
- **Tests:** `src/test/licenses/licenseDetector.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A repository without a license is reported as "sin licencia" and marked for review.
  - A function computes the hit rate over a labelled sample.

### [QA·T2 — LicenseDetector accuracy tests (over 90 %)](https://app.clickup.com/t/1amfa05xxz2)
- **Estimate:** 2 h · **Reviewer:** Leon · **Merged by:** Fri 20/11
- **Goes in:** `src/test/licenses/fixtures/ (labelled samples)`
- **Tests:** `src/test/licenses/accuracy.test.ts`
- **What the tests (or the deliverable) must cover:**
  - At least 30 labelled samples (repo responses and license headers) as fixtures.
  - The test asserts accuracy > 90 %.
