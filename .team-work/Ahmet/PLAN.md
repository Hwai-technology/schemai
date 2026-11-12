# Sprint 1 plan — Ahmet

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/core/`, `src/analysis/` |
| Your ClickUp items | COORD, HU-05, HU-06 |
| Your work | 12 h (own tasks) + 3 h (reviews) = **15 h** of 16 h capacity |
| You review | HU-07·T2 (Alexander), HU-11·T1 (Abdul), HU-04·T2 (Leon), QA·T4 (Yunus), HU-10·T1 (Yunus) |

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

**[COORD — Shared contracts in `src/types.ts` (day 1), integration in `src/extension.ts` (day 9) and v0.1.0 release preparation (day 10)](https://app.clickup.com/t/1amfa05y5xc)** (1 h)
- Create the branch `feature/COORD` from `develop` (`git checkout develop && git pull && git checkout -b feature/COORD`).
- **RED:** write the tests in `src/test/core/types.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: COORD Shared contracts in `src/types.ts` (red)` and push.
- **GREEN:** implement in `src/types.ts, src/extension.ts` only what the tests need. Use `.team-work/Ahmet/core/coordinator.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: COORD ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `COORD: Shared contracts in `src/types.ts` (day 1), integration in `src/extension.ts` (day 9) and v0.1.0 release preparation (day 10)`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).
- Contracts in `src/types.ts`. Open the PR today so it is merged tomorrow (H0).

**Ready by the next meeting:**
- [ ] COORD: PR open and task in EN REVISIÓN.

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1,5 h.*

**[HU-05·T1 — Detect the paste event in the editor](https://app.clickup.com/t/1amfa05xxye)** (1 h)
- Create the branch `feature/HU-05-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-05-T1`).
- **RED:** write the tests in `src/test/analysis/pasteMonitor.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-05 T1 Detect the paste event in the editor (red)` and push.
- **GREEN:** implement in `src/analysis/pasteMonitor.ts` only what the tests need. Use `.team-work/Ahmet/analysis/pasteMonitor.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-05 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-05 T1: Detect the paste event in the editor`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**Reviews today**
- QA·T4 (Yunus): pull the branch and check that `npm install`, `npm run compile`, `npm run lint` and `npm test` work and that the CI run on the PR is green. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-05·T1: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 3 — Wed 11/11
*Planned: about 1,5 h.*

**[HU-06·T1 — Register the commands in the palette and context menu (selection and file)](https://app.clickup.com/t/1amfa05xxyb)** (1,5 h)
- Create the branch `feature/HU-06-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-06-T1`).
- **RED:** write the tests in `src/test/analysis/commands.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-06 T1 Register the commands in the palette and context menu (red)` and push.
- **GREEN:** implement in `src/analysis/commands.ts + `contributes.commands` in package.json` only what the tests need. Use `.team-work/Ahmet/core/coordinator.ts (only `analyzeSelection` existed; the file command is new)` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-06 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-06 T1: Register the commands in the palette and context menu (selection and file)`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-06·T1: PR open and task in EN REVISIÓN.

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 2 h.*

**[HU-06·T2 — Progress indicator with cancellation](https://app.clickup.com/t/1amfa05xxya)** (1,5 h)
- Create the branch `feature/HU-06-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-06-T2`).
- **RED:** write the tests in `src/test/analysis/manualAnalysis.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-06 T2 Progress indicator with cancellation (red)` and push.
- **GREEN:** implement in `src/analysis/manualAnalysis.ts` only what the tests need. Use (new: not in the prototype) as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-06 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-06 T2: Progress indicator with cancellation`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Leon** on WhatsApp (they have 24 h).

**Reviews today**
- HU-11·T1 (Abdul): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-06·T2: PR open and task in EN REVISIÓN.
- [x] Reviews of today done (approved or changes requested).

### Day 5 — Fri 13/11
*Planned: about 0,5 h.*

**[MET — % HU completadas — P5 KPI 1: % of HUs completed](https://app.clickup.com/t/1amfa05z5km)** (0,5 h)
- First measurement: HUs in COMPLETADOS / 15. Write the value and colour on P5 page 1 and say it in the meeting.

**Ready by the next meeting:**
- [ ] MET — % HU completadas: value written on the P5 page and said in the meeting.

### Day 6 — Mon 16/11
*Planned: about 1 h.*

**[HU-05·T2 — Asynchronous paste capture without blocking editing](https://app.clickup.com/t/1amfa05xxy8)** (1 h)
- Create the branch `feature/HU-05-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-05-T2`).
- **RED:** write the tests in `src/test/analysis/analysisQueue.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-05 T2 Asynchronous paste capture without blocking editing (red)` and push.

**Ready by the next meeting:**
- [ ] HU-05·T2: branch pushed with the failing tests (red).

### Day 7 — Tue 17/11
*Planned: about 1,5 h.*

**[HU-05·T2 — Asynchronous paste capture without blocking editing](https://app.clickup.com/t/1amfa05xxy8)** (1 h)
- **GREEN:** implement in `src/analysis/analysisQueue.ts` only what the tests need. Use `.team-work/Ahmet/analysis/analysisQueue.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-05 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-05 T2: Asynchronous paste capture without blocking editing`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Reviews today**
- HU-10·T1 (Yunus): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-05·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 8 — Wed 18/11
*Planned: about 3 h.*

**[HU-05·T3 — Improve `isLikelyCode` and `generateFingerprint` to ignore trivial fragments](https://app.clickup.com/t/1amfa05xxyd)** (1,5 h)
- Create the branch `feature/HU-05-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-05-T3`).
- **RED:** write the tests in `src/test/analysis/codeAnalyzer.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-05 T3 Improve `isLikelyCode` and `generateFingerprint` to ignore trivial fragments (red)` and push.
- **GREEN:** implement in `src/analysis/codeAnalyzer.ts` only what the tests need. Use `.team-work/Ahmet/analysis/codeAnalyzer.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-05 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-05 T3: Improve `isLikelyCode` and `generateFingerprint` to ignore trivial fragments`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Reviews today**
- HU-07·T2 (Alexander): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (1 h)
- HU-04·T2 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-05·T3: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 9 — Thu 19/11
*Planned: about 1 h.*

**[COORD — Shared contracts in `src/types.ts` (day 1), integration in `src/extension.ts` (day 9) and v0.1.0 release preparation (day 10)](https://app.clickup.com/t/1amfa05y5xc)** (1 h)
- Integration: register every merged feature in `src/extension.ts` and add the smoke test.

**Ready by the next meeting:**
- [ ] COORD: today's step done.

### Day 10 — Fri 20/11
*Planned: about 2 h.*

**[COORD — Shared contracts in `src/types.ts` (day 1), integration in `src/extension.ts` (day 9) and v0.1.0 release preparation (day 10)](https://app.clickup.com/t/1amfa05y5xc)** (1 h)
- Release prep: CHANGELOG, version 0.1.0, release notes. The tag is created after the Sprint Review on 23/11.

**[MET — % HU completadas — P5 KPI 1: % of HUs completed](https://app.clickup.com/t/1amfa05z5km)** (1 h)
- Final value of the sprint, colour and the action rule if it is amber or red.

**Ready by the Sprint Review on Mon 23/11:**
- [ ] COORD: today's step done.
- [ ] MET — % HU completadas: value written on the P5 page and said in the meeting.

## Task cards

### [COORD — Shared contracts in `src/types.ts` (day 1), integration in `src/extension.ts` (day 9) and v0.1.0 release preparation (day 10)](https://app.clickup.com/t/1amfa05y5xc)
- **Estimate:** 3 h · **Reviewer:** Yunus · **Merged by:** Mon 23/11 (delivery)
- **Reference code:** `.team-work/Ahmet/core/coordinator.ts`
- **Goes in:** `src/types.ts, src/extension.ts`
- **Tests:** `src/test/core/types.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Add the contracts every feature needs: `CodeFragment`, `SourceMatch` (repo, url, path, `similarity` 0–1), `LicenseInfo` (`spdxId` or `'NONE'`), `RiskAssessment` (severity, reason, license, match) and `ProjectPolicy`.
  - A small test that builds one object of each type, so a breaking change in a contract fails CI.
  - Day 9: every merged module is registered in `activate()` through its `register(context)`; a smoke test checks that all commands are registered.

### [HU-05·T1 — Detect the paste event in the editor](https://app.clickup.com/t/1amfa05xxye)
- **Estimate:** 1 h · **Reviewer:** Abdul · **Merged by:** Wed 11/11
- **Reference code:** `.team-work/Ahmet/analysis/pasteMonitor.ts`
- **Goes in:** `src/analysis/pasteMonitor.ts`
- **Tests:** `src/test/analysis/pasteMonitor.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A change event that inserts several lines equal to the clipboard text is detected as a paste.
  - Normal typing (one character) is not a paste.
  - An empty clipboard is ignored.

### [HU-06·T1 — Register the commands in the palette and context menu (selection and file)](https://app.clickup.com/t/1amfa05xxyb)
- **Estimate:** 1,5 h · **Reviewer:** Abdul · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Ahmet/core/coordinator.ts (only `analyzeSelection` existed; the file command is new)`
- **Goes in:** `src/analysis/commands.ts + `contributes.commands` in package.json`
- **Tests:** `src/test/analysis/commands.test.ts`
- **What the tests (or the deliverable) must cover:**
  - `Analyze selection` sends only the selected text.
  - `Analyze file` sends the whole document text.
  - An empty selection shows an information message and does not analyse.

### [HU-06·T2 — Progress indicator with cancellation](https://app.clickup.com/t/1amfa05xxya)
- **Estimate:** 1,5 h · **Reviewer:** Leon · **Merged by:** Fri 13/11
- **Reference code:** (new: not in the prototype)
- **Goes in:** `src/analysis/manualAnalysis.ts`
- **Tests:** `src/test/analysis/manualAnalysis.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Manual analysis runs inside a cancellable progress notification.
  - If the cancellation token fires, no search is started.
  - At the end, a summary says how many fragments were analysed.

### [HU-05·T2 — Asynchronous paste capture without blocking editing](https://app.clickup.com/t/1amfa05xxy8)
- **Estimate:** 2 h · **Reviewer:** Alexander · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/Ahmet/analysis/analysisQueue.ts`
- **Goes in:** `src/analysis/analysisQueue.ts`
- **Tests:** `src/test/analysis/analysisQueue.test.ts`
- **What the tests (or the deliverable) must cover:**
  - `enqueue()` returns immediately (does not wait for the analysis).
  - Pastes within 500 ms are merged (debounce).
  - The same fingerprint is not analysed twice.

### [HU-05·T3 — Improve `isLikelyCode` and `generateFingerprint` to ignore trivial fragments](https://app.clickup.com/t/1amfa05xxyd)
- **Estimate:** 1,5 h · **Reviewer:** Alexander · **Merged by:** Thu 19/11
- **Reference code:** `.team-work/Ahmet/analysis/codeAnalyzer.ts`
- **Goes in:** `src/analysis/codeAnalyzer.ts`
- **Tests:** `src/test/analysis/codeAnalyzer.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A plain sentence like "Please return the form (signed) by Friday" is NOT code.
  - A 3-line function IS code.
  - A fragment below the minimum size is ignored.
  - The fingerprint keeps license header comments (the prototype stripped them and broke header detection).

### [MET — % HU completadas — P5 KPI 1: % of HUs completed](https://app.clickup.com/t/1amfa05z5km)
- **Estimate:** 1,5 h · **Reviewer:** Yusuf · **Due:** Fri 20/11
