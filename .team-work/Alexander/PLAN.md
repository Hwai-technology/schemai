# Sprint 1 plan — Alexander

**Sprint 1:** Mon 9/11 → Fri 20/11 (10 working days, daily Scrum Meeting Mon–Fri). Integration buffer on the weekend, Sprint Review and delivery of v0.1.0 on Mon 23/11.

| | |
|---|---|
| Your folders | `src/search/` |
| Your ClickUp items | HU-07 |
| Your work | 10,5 h (own tasks) + 3 h (reviews) = **13,5 h** of 16 h capacity |
| You review | HU-05·T2 (Ahmet), HU-05·T3 (Ahmet), HU-12·T1 (Abdul), QA·T3 (Leon), HU-02·T1 (Yusuf), QA·T1 (Yunus) |
| Also | You own the 3 milestone tasks (◆ HITO 0/1/2) and the P5 milestone KPI. |

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

**[HU-07·T1 — Prototype: limits of GitHub Search API and response time (risk)](https://app.clickup.com/t/1amfa05xxyf)** (1 h)
- Read the reference client, create a GitHub token, prepare the 20 sample fragments.

**Ready by the next meeting:**
- [ ] HU-07·T1: progress of the prototype (see today's step).

### Day 2 — Tue 10/11
> ◆ H0 — Technical base ready (CI + contracts) is today.
*Planned: about 1,25 h.*

**[HU-07·T1 — Prototype: limits of GitHub Search API and response time (risk)](https://app.clickup.com/t/1amfa05xxyf)** (1 h)
- Run the measurements and write down the numbers.

**[MET — Cumplimiento de hitos — P5 KPI 4: milestone compliance](https://app.clickup.com/t/1amfa05z5qd)** (0,25 h)
- H0 check: if QA·T4 (CI) is merged, close ◆ HITO 0 in ClickUp and write the row on P5 page 4.

**Ready by the next meeting:**
- [ ] HU-07·T1: progress of the prototype (see today's step).
- [ ] MET — Cumplimiento de hitos: value written on the P5 page and said in the meeting.

### Day 3 — Wed 11/11
*Planned: about 1,5 h.*

**[HU-07·T1 — Prototype: limits of GitHub Search API and response time (risk)](https://app.clickup.com/t/1amfa05xxyf)** (1 h)
- Write the report and the go / no-go proposal in ClickUp. Move the task to EN REVISIÓN so Sergio reviews it tomorrow.

**Reviews today**
- HU-02·T1 (Yusuf): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-07·T1: report and go / no-go proposal posted in ClickUp, task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 4 — Thu 12/11
> ◆ H1 — Go / no-go decision on GitHub search (HU-07) is today.
*Planned: about 0,25 h.*

**[MET — Cumplimiento de hitos — P5 KPI 4: milestone compliance](https://app.clickup.com/t/1amfa05z5qd)** (0,25 h)
- H1: after the go / no-go decision in today's meeting, close ◆ HITO 1 and write the row.

**Ready by the next meeting:**
- [ ] MET — Cumplimiento de hitos: value written on the P5 page and said in the meeting.

### Day 5 — Fri 13/11
*Planned: about 1,5 h.*

**[HU-07·T2 — Restructure SourceSearchEngine to query only with representative fragments](https://app.clickup.com/t/1amfa05xxy9)** (1 h)
- Create the branch `feature/HU-07-T2` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-07-T2`).
- **RED:** write the tests in `src/test/search/queryBuilder.test.ts, src/test/search/githubSearchClient.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-07 T2 Restructure SourceSearchEngine to query only with representative fragments (red)` and push.
- Start only after the go / no-go decision of yesterday.

**Reviews today**
- QA·T1 (Yunus): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-07·T2: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 6 — Mon 16/11
*Planned: about 1,5 h.*

**[HU-07·T2 — Restructure SourceSearchEngine to query only with representative fragments](https://app.clickup.com/t/1amfa05xxy9)** (1,5 h)
- **GREEN:** implement in `src/search/githubSearchClient.ts + src/search/queryBuilder.ts` only what the tests need. Use `.team-work/Alexander/search/githubSearchClient.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-07 T2 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.

**Ready by the next meeting:**
- [ ] HU-07·T2: tests passing locally; PR ready to open.

### Day 7 — Tue 17/11
*Planned: about 2 h.*

**[HU-07·T2 — Restructure SourceSearchEngine to query only with representative fragments](https://app.clickup.com/t/1amfa05xxy9)** (0,5 h)
- **PR:** open a pull request to `develop` titled `HU-07 T2: Restructure SourceSearchEngine to query only with representative fragments`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Ahmet** on WhatsApp (they have 24 h).

**[HU-07·T3 — Optimise the query and sort by similarity (15 s or less)](https://app.clickup.com/t/1amfa05xxyc)** (1 h)
- Create the branch `feature/HU-07-T3` from `develop` (`git checkout develop && git pull && git checkout -b feature/HU-07-T3`).
- **RED:** write the tests in `src/test/search/similarity.test.ts` for the cases in the task card below. Run `npm test`: they must **fail**, and for the right reason. Commit `test: HU-07 T3 Optimise the query and sort by similarity (red)` and push.

**Reviews today**
- HU-12·T1 (Abdul): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-07·T2: PR open and task in EN REVISIÓN.
- [ ] HU-07·T3: branch pushed with the failing tests (red).
- [ ] Reviews of today done (approved or changes requested).

### Day 8 — Wed 18/11
*Planned: about 2 h.*

**[HU-07·T3 — Optimise the query and sort by similarity (15 s or less)](https://app.clickup.com/t/1amfa05xxyc)** (1,5 h)
- **GREEN:** implement in `src/search/similarity.ts` only what the tests need. Use `.team-work/Alexander/search/similarityCalculator.ts` as reference: copy the idea, not the whole file. Run `npm test` until it is green. Commit `feat: HU-07 T3 ...`.
- **REFACTOR:** clean the code with the tests green, run `npm run lint`. Commit `refactor: ...` if you changed anything.

**Reviews today**
- HU-05·T2 (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-07·T3: tests passing locally; PR ready to open.
- [ ] Reviews of today done (approved or changes requested).

### Day 9 — Thu 19/11
*Planned: about 1 h.*

**[HU-07·T3 — Optimise the query and sort by similarity (15 s or less)](https://app.clickup.com/t/1amfa05xxyc)** (0,5 h)
- **PR:** open a pull request to `develop` titled `HU-07 T3: Optimise the query and sort by similarity (15 s or less)`, paste the ClickUp link, move the task to **EN REVISIÓN** and tell **Yunus** on WhatsApp (they have 24 h).

**Reviews today**
- HU-05·T3 (Ahmet): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the next meeting:**
- [ ] HU-07·T3: PR open and task in EN REVISIÓN.
- [ ] Reviews of today done (approved or changes requested).

### Day 10 — Fri 20/11
*Planned: about 1,5 h.*

**[MET — Cumplimiento de hitos — P5 KPI 4: milestone compliance](https://app.clickup.com/t/1amfa05z5qd)** (1 h)
- Prepare H2 (closes on 22/11): check COORD, fill the results table and the global % on P5 page 4.

**Reviews today**
- QA·T3 (Leon): check the first commit is `test:`, CI is green, the cases in the task card are covered and the DoD (P6 page 1a) is met. Approve or request changes in GitHub. (0,5 h)

**Ready by the Sprint Review on Mon 23/11:**
- [ ] MET — Cumplimiento de hitos: value written on the P5 page and said in the meeting.
- [ ] Reviews of today done (approved or changes requested).

## Task cards

### [HU-07·T1 — Prototype: limits of GitHub Search API and response time (risk)](https://app.clickup.com/t/1amfa05xxyf)
- **Estimate:** 3 h · **Reviewer:** Sergio · **Merged by:** Thu 12/11
- **Reference code:** `.team-work/Alexander/search/githubSearchClient.ts`
- **Goes in:** (spike: a script and a written report, not production code)
- **What the tests (or the deliverable) must cover:**
  - Measure how many code searches per minute the API allows with a token.
  - Measure response time for 20 sample fragments (short, long, popular, rare).
  - Write the findings and a go / no-go proposal as a comment on HU-07·T1 in ClickUp: continue with GitHub Code Search, or the plan B (cache / alternative source).

### [MET — Cumplimiento de hitos — P5 KPI 4: milestone compliance](https://app.clickup.com/t/1amfa05z5qd)
- **Estimate:** 1,5 h · **Reviewer:** Yunus · **Due:** Fri 20/11

### [HU-07·T2 — Restructure SourceSearchEngine to query only with representative fragments](https://app.clickup.com/t/1amfa05xxy9)
- **Estimate:** 3 h · **Reviewer:** Ahmet · **Merged by:** Wed 18/11
- **Reference code:** `.team-work/Alexander/search/githubSearchClient.ts`
- **Goes in:** `src/search/githubSearchClient.ts + src/search/queryBuilder.ts`
- **Tests:** `src/test/search/queryBuilder.test.ts, src/test/search/githubSearchClient.test.ts`
- **What the tests (or the deliverable) must cover:**
  - The query is built from the 3 most representative lines (no braces, no blank lines, no comments).
  - The client calls the code search endpoint with the auth header (use Yunus's GitHub API mock).
  - It returns `SourceMatch[]` from `src/types.ts`.
  - No hard-coded signatures (the Shotcut ones in the prototype are NOT ported).

### [HU-07·T3 — Optimise the query and sort by similarity (15 s or less)](https://app.clickup.com/t/1amfa05xxyc)
- **Estimate:** 3 h · **Reviewer:** Yunus · **Merged by:** Fri 20/11
- **Reference code:** `.team-work/Alexander/search/similarityCalculator.ts`
- **Goes in:** `src/search/similarity.ts`
- **Tests:** `src/test/search/similarity.test.ts`
- **What the tests (or the deliverable) must cover:**
  - Two identical fragments give similarity 1.0; unrelated ones give close to 0.
  - Results are sorted from highest to lowest similarity.
  - A full search of a 30-line fragment with mocked latency finishes in 15 s or less.
