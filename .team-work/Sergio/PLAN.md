# Sprint 1 plan — Sergio

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/llm/`, `src/quickfix/` |
| Your ClickUp items | HU-14, HU-15 |
| Your work | 10,33 h (own tasks) + 3 h (reviews) = **13,33 h** of 16 h capacity |
| You review | HU-07·T1 (Alexander), HU-09·T1 (David), MET — Desviación de esfuerzo (David), HU-03·T2 (Yusuf), HU-02·T4 (Yusuf), MET — Tiempo bloqueada (Yusuf) |

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

**[HU-14·T1 — HTTPS connection with the LLM provider](https://app.clickup.com/t/1amfa05xxz5)** (0,5 h)
- Create the branch `feature/HU-14-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-14-T1`).
- **RED:** write the tests in `src/test/llm/llmClient.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-14 T1 HTTPS connection with the LLM provider (red)` and push.

**Ready by the next meeting:**
- [ ] HU-14·T1: branch pushed with the failing tests (red).

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1 h.*

**[HU-14·T1 — HTTPS connection with the LLM provider](https://app.clickup.com/t/1amfa05xxz5)** (1 h)
- **GREEN:** implement in `src/llm/llmClient.ts` only what the tests need. Use `.team-work/Sergio/llm/llmExplainer.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-14 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-14 T1: HTTPS connection with the LLM provider`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yusuf** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-14·T1: PR open and task in EN REVISIÓN.

### Day 3 — Wed 11/11
*Planned: about 2 h.*

**[HU-14·T2 — Explanation prompts in Spanish and English](https://app.clickup.com/t/1amfa05xxz4)** (1,5 h)
- Create the branch `feature/HU-14-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-14-T2`).
- **RED:** write the tests in `src/test/llm/prompts.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-14 T2 Explanation prompts in Spanish and English (red)` and push.
- **GREEN:** implement in `src/llm/prompts.ts` only what the tests need. Use `.team-work/Sergio/llm/llmExplainer.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-14 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-14 T2: Explanation prompts in Spanish and English`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **David** on WhatsApp (they have 24 h).

**Reviews today**
- HU-09·T1 (David): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-14·T2: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 1 h.*

**Reviews today**
- HU-07·T1 (Alexander): read the prototype report in ClickUp and challenge the go / no-go proposal before today's meeting. (0,5 h)
- HU-03·T2 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] Reviews of today done (approved or changes requested).

### Day 5 — Fri 13/11
*Planned: about 2,5 h.*

**[HU-14·T3 — Fixed license summaries to use without the LLM](https://app.clickup.com/t/1amfa05y4t0)** (1,5 h)
- Create the branch `feature/HU-14-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-14-T3`).
- **RED:** write the tests in `src/test/llm/fixedSummaries.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-14 T3 Fixed license summaries to use without the LLM (red)` and push.
- **GREEN:** implement in `src/llm/fixedSummaries.ts` only what the tests need. Use — as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-14 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-14 T3: Fixed license summaries to use without the LLM`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **David** on WhatsApp (they have 24 h).

**[MET — Revisión semanal e informe de indicadores — P5: weekly review and indicators report](https://app.clickup.com/t/1amfa05y7a3)** (0,5 h)
- Weekly report: collect the values of all KPIs and post the summary in the group.

**Reviews today**
- HU-02·T4 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-14·T3: PR open and task in EN REVISIÓN.
- [ ] MET — Revisión semanal e informe de indicadores: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1 h.*

**[HU-15·T1 — CodeActionProvider with the Quick Fixes](https://app.clickup.com/t/1amfa05xxzc)** (1 h)
- Create the branch `feature/HU-15-T1` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-15-T1`).
- **RED:** write the tests in `src/test/quickfix/codeActionProvider.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-15 T1 CodeActionProvider with the Quick Fixes (red)` and push.
- Needs HU-11·T1 (merged last Thursday).

**Ready by the next meeting:**
- [ ] HU-15·T1: branch pushed with the failing tests (red).

### Day 7 — Tue 17/11
*Planned: about 1 h.*

**[HU-15·T1 — CodeActionProvider with the Quick Fixes](https://app.clickup.com/t/1amfa05xxzc)** (1 h)
- **GREEN:** implement in `src/quickfix/codeActionProvider.ts` only what the tests need. Use `.team-work/Sergio/quickfix/codeActionProvider.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-15 T1 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.
- **PR:** open a pull request to `develop` titled `HU-15 T1: CodeActionProvider with the Quick Fixes`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Abdul** on WhatsApp (they have 24 h).

**Ready by the next meeting:**
- [ ] HU-15·T1: PR open and task in EN REVISIÓN.

### Day 8 — Wed 18/11
*Planned: about 1,5 h.*

**[HU-15·T2 — Diff preview and confirmation](https://app.clickup.com/t/1amfa05xxzb)** (1,5 h)
- Create the branch `feature/HU-15-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-15-T2`).
- **RED:** write the tests in `src/test/quickfix/diffPreview.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-15 T2 Diff preview and confirmation (red)` and push.

**Ready by the next meeting:**
- [ ] HU-15·T2: branch pushed with the failing tests (red).

### Day 9 — Thu 19/11
*Planned: about 1 h.*

**[HU-15·T2 — Diff preview and confirmation](https://app.clickup.com/t/1amfa05xxzb)** (1 h)
- **PR:** open a pull request to `develop` titled `HU-15 T2: Diff preview and confirmation`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).
- This is the lowest-priority task (Should): if the sprint is at risk, it is the first one to move to Sprint 2.

**Ready by the next meeting:**
- [ ] HU-15·T2: PR open and task in EN REVISIÓN.

### Day 10 — Fri 20/11
*Planned: about 1,83 h.*

**[MET — Revisión semanal e informe de indicadores — P5: weekly review and indicators report](https://app.clickup.com/t/1amfa05y7a3)** (0,83 h)
- Final report of the sprint for the Review and Retro on 23/11.

**Reviews today**
- MET — Desviación de esfuerzo (David): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)
- MET — Tiempo bloqueada (Yusuf): read the P5 page and confirm the value is filled in and the colour follows its own rule. (0,5 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Revisión semanal e informe de indicadores: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [HU-14·T1 — HTTPS connection with the LLM provider](https://app.clickup.com/t/1amfa05xxz5)
- **Estimate:** 1,5 h · **Reviewer:** Yusuf · **Merged by:** Wed 11/11
- **Reference code:** `.team-work/Sergio/llm/llmExplainer.ts`
- **Goes in:** `src/llm/llmClient.ts`
- **Tests:** `src/test/llm/llmClient.test.ts`
- **What the tests (or the deliverable) must cover:**
  - With a fake HTTP client and a fake token store: sends an HTTPS request with the token from SecretStorage.
  - A timeout returns a fallback, it does not throw.
  - The token is never logged.

### [HU-14·T2 — Explanation prompts in Spanish and English](https://app.clickup.com/t/1amfa05xxz4)
- **Estimate:** 1,5 h · **Reviewer:** David · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Sergio/llm/llmExplainer.ts`
- **Goes in:** `src/llm/prompts.ts`
- **Tests:** `src/test/llm/prompts.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The prompt includes the license name and asks for obligations, in Spanish or English.
  - The language follows the VS Code locale.

### [HU-14·T3 — Fixed license summaries to use without the LLM](https://app.clickup.com/t/1amfa05y4t0)
- **Estimate:** 1,5 h · **Reviewer:** David · **Merged by:** Mon 16/11
- **Goes in:** `src/llm/fixedSummaries.ts`
- **Tests:** `src/test/llm/fixedSummaries.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Every license in David's compatibility matrix has a fixed summary.
  - The summary is used when the LLM is not available.

### [MET — Revisión semanal e informe de indicadores — P5: weekly review and indicators report](https://app.clickup.com/t/1amfa05y7a3)
- **Estimate:** 1,33 h · **Reviewer:** Abdul · **Due:** Fri 20/11

### [HU-15·T1 — CodeActionProvider with the Quick Fixes](https://app.clickup.com/t/1amfa05xxzc)
- **Estimate:** 2 h · **Reviewer:** Abdul · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/Sergio/quickfix/codeActionProvider.ts`
- **Goes in:** `src/quickfix/codeActionProvider.ts`
- **Tests:** `src/test/quickfix/codeActionProvider.test.ts`
- **What the tests (or the deliverable) must cover:**
  - A SchemAI diagnostic offers "Add attribution comment" and "Ignore".
  - Diagnostics from other extensions get no actions.

### [HU-15·T2 — Diff preview and confirmation](https://app.clickup.com/t/1amfa05xxzb)
- **Estimate:** 2,5 h · **Reviewer:** Yunus · **Merged by:** Fri 20/11
- **Goes in:** `src/quickfix/diffPreview.ts`
- **Tests:** `src/test/quickfix/diffPreview.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The preview shows the code before and after the fix.
  - Nothing is applied until the user confirms.
