# Sprint 1 plan — Abdul

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/alerts/` |
| Your ClickUp items | HU-11, HU-12 |
| Your work | 8,5 h (own tasks) + 4 h (reviews) = **12,5 h** of 16 h capacity |
| You review | HU-05·T1 (Ahmet), HU-06·T1 (Ahmet), HU-02·T2 (Yusuf), HU-02·T3 (Yusuf), HU-13·T1 (Yusuf), MET — Revisión semanal e informe de indicadores (Sergio), HU-15·T1 (Sergio), MET — % tests superados en CI (Yunus) |
| Also | You are also the Product Owner: answer requirement questions on WhatsApp within 4 h and run the acceptance checklist at the Sprint Review (23/11). |

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
*Planned: about 0,5 h.*

**[HU-11·T1 — Create DiagnosticsManager for the Problems panel](https://app.clickup.com/t/1amfa05xxym)** (0,5 h)
- Create the branch `feature/HU-11-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-11-T1`).
- **RED:** write the tests in `src/test/alerts/diagnosticsManager.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-11 T1 Create DiagnosticsManager for the Problems panel (red)` and push.

**Ready by the next meeting:**
- [ ] HU-11·T1: branch pushed with the failing tests (red).

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1 h.*

**[HU-11·T1 — Create DiagnosticsManager for the Problems panel](https://app.clickup.com/t/1amfa05xxym)** (1 h)
- **GREEN:** implement in `src/alerts/diagnosticsManager.ts` only what the tests need. Use `.team-work/Abdul/alerts/diagnosticsManager.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-11 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- Uses the contracts from `src/types.ts` (COORD, merged today).

**Ready by the next meeting:**
- [ ] HU-11·T1: tests passing locally; PR ready to open.

### Day 3 — Wed 11/11
*Planned: about 1,5 h.*

**[HU-11·T1 — Create DiagnosticsManager for the Problems panel](https://app.clickup.com/t/1amfa05xxym)**
- **PR:** open a pull request to `develop` titled `HU-11 T1: Create DiagnosticsManager for the Problems panel`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Ahmet** on WhatsApp (they have 24 h).
- First thing in the morning.

**[HU-11·T2 — Non-intrusive underline decorations](https://app.clickup.com/t/1amfa05xxyu)** (1 h)
- Create the branch `feature/HU-11-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-11-T2`).
- **RED:** write the tests in `src/test/alerts/editorDecorator.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-11 T2 Non-intrusive underline decorations (red)` and push.
- **GREEN:** implement in `src/alerts/editorDecorator.ts` only what the tests need. Use `.team-work/Abdul/alerts/editorDecorator.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-11 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- Open the PR tomorrow morning, after HU-11·T1 is merged.

**Reviews today**
- HU-05·T1 (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-11·T1: PR open and task in EN REVISIÓN.
- [ ] HU-11·T2: tests passing locally; PR ready to open.
- [ ] Reviews of today done (approved or changes requested).

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 1 h.*

**[HU-11·T2 — Non-intrusive underline decorations](https://app.clickup.com/t/1amfa05xxyu)**
- **PR:** open a pull request to `develop` titled `HU-11 T2: Non-intrusive underline decorations`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yusuf** on WhatsApp (they have 24 h).
- First thing in the morning.

**Reviews today**
- HU-06·T1 (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- HU-02·T2 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-11·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 5 — Fri 13/11
*Planned: about 1 h.*

**[MET — Clasificación y revisión del Doc P5 — P5: classification and review of the indicators doc](https://app.clickup.com/t/1amfa05z5qe)** (0,5 h)
- Check that every KPI page has its first value of the week.

**Reviews today**
- HU-02·T3 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] MET — Clasificación y revisión del Doc P5: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1,5 h.*

**[HU-12·T1 — HoverProvider with the alert summary](https://app.clickup.com/t/1amfa05xxyw)** (1,5 h)
- Create the branch `feature/HU-12-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-12-T1`).
- **RED:** write the tests in `src/test/alerts/hoverProvider.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-12 T1 HoverProvider with the alert summary (red)` and push.
- **GREEN:** implement in `src/alerts/hoverProvider.ts` only what the tests need. Use `.team-work/Abdul/alerts/hoverProvider.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-12 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-12 T1: HoverProvider with the alert summary`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Alexander** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-12·T1: PR open and task in EN REVISIÓN.

### Day 7 — Tue 17/11
*Planned: about 1 h.*

**[HU-12·T2 — Detail view (Webview) with links to the sources](https://app.clickup.com/t/1amfa05xxyx)** (1 h)
- Create the branch `feature/HU-12-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-12-T2`).
- **RED:** write the tests in `src/test/alerts/riskCardPanel.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-12 T2 Detail view (red)` and push.

**Ready by the next meeting:**
- [ ] HU-12·T2: branch pushed with the failing tests (red).

### Day 8 — Wed 18/11
*Planned: about 2,5 h.*

**[HU-12·T2 — Detail view (Webview) with links to the sources](https://app.clickup.com/t/1amfa05xxyx)** (1,5 h)
- **GREEN:** implement in `src/alerts/riskCardPanel.ts` only what the tests need. Use `.team-work/Abdul/alerts/riskCardPanel.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-12 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-12 T2: Detail view (Webview) with links to the sources`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **David** on WhatsApp (they have 24 h).

**Reviews today**
- HU-13·T1 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)
- HU-15·T1 (Sergio): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-12·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 9 — Thu 19/11
*Planned: about 0,5 h.*

**[HU-12·T2 — Detail view (Webview) with links to the sources](https://app.clickup.com/t/1amfa05xxyx)** (0,5 h)
- Apply David's review comments so it is merged today.

**Ready by the next meeting:**
- [ ] HU-12·T2: review comments applied and merged.

### Day 10 — Fri 20/11
*Planned: about 2 h.*

**[MET — Clasificación y revisión del Doc P5 — P5: classification and review of the indicators doc](https://app.clickup.com/t/1amfa05z5qe)** (1 h)
- Final review of the P5 doc and classification of the results.

**Reviews today**
- MET — Revisión semanal e informe de indicadores (Sergio): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)
- MET — % tests superados en CI (Yunus): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Clasificación y revisión del Doc P5: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [HU-11·T1 — Create DiagnosticsManager for the Problems panel](https://app.clickup.com/t/1amfa05xxym)
- **Estimate:** 1,5 h · **Reviewer:** Ahmet · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Abdul/alerts/diagnosticsManager.ts`
- **Goes in:** `src/alerts/diagnosticsManager.ts`
- **Tests:** `src/test/alerts/diagnosticsManager.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Inject a fake DiagnosticCollection: a high risk creates an Error diagnostic on the fragment range.
  - A medium risk creates a Warning.
  - Clearing a document removes its diagnostics.
  - The message includes the license and the source repository.

### [HU-11·T2 — Non-intrusive underline decorations](https://app.clickup.com/t/1amfa05xxyu)
- **Estimate:** 1 h · **Reviewer:** Yusuf · **Merged by:** Fri 13/11
- **Reference code:** `.team-work/Abdul/alerts/editorDecorator.ts`
- **Goes in:** `src/alerts/editorDecorator.ts`
- **Tests:** `src/test/alerts/editorDecorator.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The decoration type is created once.
  - Only risky fragments get the decoration.
  - Decorations are disposed when the document closes.

### [MET — Clasificación y revisión del Doc P5 — P5: classification and review of the indicators doc](https://app.clickup.com/t/1amfa05z5qe)
- **Estimate:** 1,5 h · **Reviewer:** Leon · **Due:** Fri 20/11

### [HU-12·T1 — HoverProvider with the alert summary](https://app.clickup.com/t/1amfa05xxyw)
- **Estimate:** 1,5 h · **Reviewer:** Alexander · **Merged by:** Tue 17/11
- **Reference code:** `.team-work/Abdul/alerts/hoverProvider.ts`
- **Goes in:** `src/alerts/hoverProvider.ts`
- **Tests:** `src/test/alerts/hoverProvider.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Hovering a flagged range returns markdown with license, repository link and similarity.
  - Hovering anywhere else returns `undefined`.

### [HU-12·T2 — Detail view (Webview) with links to the sources](https://app.clickup.com/t/1amfa05xxyx)
- **Estimate:** 3 h · **Reviewer:** David · **Merged by:** Thu 19/11
- **Reference code:** `.team-work/Abdul/alerts/riskCardPanel.ts`
- **Goes in:** `src/alerts/riskCardPanel.ts`
- **Tests:** `src/test/alerts/riskCardPanel.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The generated HTML contains the source links.
  - The pasted code is escaped (no script injection).
  - If the panel is already open, it is reused.
