# Requirements Traceability Matrix — MVP (Phase 6)

- Written: 2026-10-08 (Europe/Prague) by the `qa-documenter` role.
- Pins: docs `b920bea` + this commit, backend `main` `26648ee`, frontend `main` `a8aeb06`.
- Join source: `docs/qa/workspace-traceability-report.md` (`node scripts/check-workspace.mjs`, re-run 2026-10-08: 64 MVP requirements, PASS, 2 contract-pin warnings). Per-requirement test files come from each code repo's committed `trace/trace.json`; clips from `../frontend/docs/qa/demo-recordings/*/manifest.json`.
- Code-repo paths below are relative to the workspace root (`../backend`, `../frontend` from this repo).

## How to read a verdict

- **PASS** = every owner repo has `@trace`-tagged tests for the id, AND every declared verification method has its artifact: `local-verifiable` → test battery green (`../backend/docs/qa/automated-verification-latest.md`, `../frontend/docs/qa/automated-verification-latest.md`); `e2e` → frontend Playwright spec, mocked suite green in the frontend battery and real-stack suite `../frontend/docs/qa/e2e-stack-latest.md` (21 passed / 0 failed / 0 flaky / 0 skipped, at frontend `2683a5b` vs backend `26648ee`); `recording` → asserted clip in `../frontend/docs/qa/recordings-report.md` (33/33 PASS); `vision-verify` → clip with a **current** `vision.met` verdict (`../frontend/docs/qa/vision-report.md`); `a11y` → `../frontend/docs/qa/a11y-report.json` (`passed`, 15 routes x light + dark).
- A missing artifact is **NOT-EARNED**, never PASS. No MVP row declares `eval` or `deploy-gated` (see `mvp-acceptance-report.md` §Scope NOT delivered).
- These are deterministic verdicts. Judgment gates (G1/G3 owner sign-off, review gates) sit on top and are reported in `mvp-acceptance-report.md`.
- "illustrated by" clips are not the deciding evidence for that row. Clips from the `phase6-admin-theme` set (`rec-*`) carry **no current vision verdict** (superseded 2026-10-08, not re-judged) — they illustrate only.
- Manual test case column: see `manual-test-plan.md` (cases are grouped by capability; the MT id per group is in the group table at the end).

| Req | Group | Slice | Owner(s) | Declared methods | Backend tests (files) | Frontend tests (files) | Method evidence | Verdict |
|---|---|---|---|---|---|---|---|---|
| FR-1 | Content | authoring-tasks | backend, frontend | local-verifiable, e2e | 5: `ContentAuthoringIT.kt`, `SourceApiTest.kt`, `SourceRulesTest.kt`, … | 3: `SourcesScreen.test.tsx`, `authoring-sources.spec.ts`, `authoring-to-practice.spec.ts` | lv: unit/IT green (AV-latest both repos); e2e: 2 spec(s) incl. real-stack; illustrated by `rec-source-upload` | PASS |
| FR-2 | Content | authoring-tasks | backend, frontend | e2e | 1: `SourceApiTest.kt` | 7: `page.test.ts`, `pdf.test.ts`, `PdfViewer.test.tsx`, … | e2e: 2 spec(s); illustrated by `rec-pdf-beside-editor` | PASS |
| FR-3 | Content | authoring-tasks | backend, frontend | e2e | 3: `ContentAuthoringIT.kt`, `TaskApiTest.kt`, `TaskRulesTest.kt` | 4: `TaskEditorScreen.test.tsx`, `taskForm.test.ts`, `authoring-tasks.spec.ts`, … | e2e: 2 spec(s) incl. real-stack; illustrated by `nfr8-single-part-task-entry` | PASS |
| FR-4 | Content | authoring-tasks | backend, frontend | e2e | 3: `ContentAuthoringIT.kt`, `TaskApiTest.kt`, `UploadLimitsIT.kt` | 3: `PreviewScreen.test.tsx`, `TaskEditorScreen.test.tsx`, `authoring-tasks.spec.ts` | e2e: 1 spec(s); illustrated by `rec-task-images` | PASS |
| FR-5 | Content | authoring-tasks | backend | local-verifiable | 2: `TaskApiTest.kt`, `TaskRulesTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-6 | Content | authoring-tasks | backend, frontend | local-verifiable | 4: `ContentAuthoringIT.kt`, `SpecRulesTest.kt`, `TaskApiTest.kt`, … | 2: `TaskEditorScreen.test.tsx`, `taskForm.test.ts` | lv: unit/IT green (AV-latest both repos); illustrated by `rec-parts-hints-translations` | PASS |
| FR-7 | Content | authoring-tasks | backend, frontend | local-verifiable | 2: `TaskApiTest.kt`, `TaskRulesTest.kt` | 4: `PreviewScreen.test.tsx`, `TaskEditorScreen.test.tsx`, `taskForm.test.ts`, … | lv: unit/IT green (AV-latest both repos); illustrated by `rec-parts-hints-translations`, `rec-preview-tester` | PASS |
| FR-8 | Content | authoring-tasks | backend, frontend | local-verifiable | 3: `ContentAuthoringIT.kt`, `TaskApiTest.kt`, `TaskRulesTest.kt` | 5: `TaskView.test.tsx`, `PreviewScreen.test.tsx`, `TaskEditorScreen.test.tsx`, … | lv: unit/IT green (AV-latest both repos); illustrated by `rec-parts-hints-translations`, `rec-preview-tester` | PASS |
| FR-9 | Content | authoring-missions | backend, frontend | e2e | 3: `MissionApiTest.kt`, `MissionRulesTest.kt`, `MissionsIT.kt` | 6: `AdminLayout.test.tsx`, `MissionEditorScreen.test.tsx`, `missionForm.test.ts`, … | e2e: 2 spec(s) incl. real-stack; illustrated by `slice6-mission-create-reorder-publish`, `slice6-mission-publish-refused`, `slice6-mission-list` | PASS |
| FR-10 | Content | authoring-tasks | backend, frontend | e2e | 1: `TaskApiTest.kt` | 3: `TaskView.test.tsx`, `PreviewScreen.test.tsx`, `authoring-preview.spec.ts` | e2e: 1 spec(s); illustrated by `rec-preview-tester` | PASS |
| FR-11 | Content | authoring-tasks | backend, frontend | e2e | 4: `ContentAuthoringIT.kt`, `SourceRulesTest.kt`, `TaskApiTest.kt`, … | 2: `TaskListScreen.test.tsx`, `authoring-tasks.spec.ts` | e2e: 1 spec(s); illustrated by `rec-task-list-provenance` | PASS |
| FR-12 | Content | authoring-missions | backend | local-verifiable | 3: `MissionApiTest.kt`, `MissionsIT.kt`, `PracticeIT.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-13 | Content | authoring-tasks | backend, frontend | e2e | 2: `ContentAuthoringIT.kt`, `TaskApiTest.kt` | 3: `SourceViewerScreen.test.tsx`, `TaskListScreen.test.tsx`, `authoring-tasks.spec.ts` | e2e: 1 spec(s); illustrated by `rec-task-list-provenance` | PASS |
| FR-55 | Content | authoring-missions | backend, frontend | e2e | 2: `MissionApiTest.kt`, `MissionsIT.kt` | 8: `MissionEditorScreen.test.tsx`, `missionForm.test.ts`, `SourceEditScreen.test.tsx`, … | e2e: 3 spec(s) incl. real-stack; illustrated by `slice6-mission-create-reorder-publish`, `slice6-source-edit-delete-refused`, `slice6-task-status-blocked` | PASS |
| FR-56 | Content | authoring-missions | backend | local-verifiable | 5: `MissionApiTest.kt`, `MissionRulesTest.kt`, `MissionsIT.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-57 | Content | authoring-missions | backend | local-verifiable | 3: `MissionApiTest.kt`, `MissionRulesTest.kt`, `MissionsIT.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-14 | Checking | answer-checker | backend | local-verifiable | 4: `AnswerCheckerPropertyTest.kt`, `CheckerEdgeCasesTest.kt`, `CheckingContractAlignmentTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-15 | Checking | answer-checker | backend | local-verifiable | 3: `AnswerCheckerPropertyTest.kt`, `CheckerEdgeCasesTest.kt`, `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-16 | Checking | answer-checker | backend | local-verifiable | 2: `AnswerCheckerPropertyTest.kt`, `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-17 | Checking | answer-checker | backend | local-verifiable | 2: `AnswerCheckerPropertyTest.kt`, `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-18 | Checking | answer-checker | backend | local-verifiable | 1: `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-19 | Checking | answer-checker | backend | local-verifiable | 2: `AnswerCheckerPropertyTest.kt`, `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-20 | Checking | answer-checker | backend | local-verifiable | 1: `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-21 | Checking | answer-checker | backend | local-verifiable | 2: `CheckerEdgeCasesTest.kt`, `GoldenTableTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-22 | Checking | practice-flow | backend, frontend | local-verifiable, e2e | 2: `PracticeIT.kt`, `PracticeRulesTest.kt` | 3: `practice.test.ts`, `TaskScreen.test.tsx`, `practice-task.spec.ts` | lv: unit/IT green (AV-latest both repos); e2e: 1 spec(s); illustrated by `slice7-unparseable` | PASS |
| FR-23 | Checking | answer-checker | backend | local-verifiable | 4: `CheckerTimingTest.kt`, `CheckingPurityTest.kt`, `GoldenScenarioCoverageTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-24 | Practice | practice-flow | backend, frontend | e2e | 1: `PracticeIT.kt` | 5: `App.test.tsx`, `HqScreen.test.tsx`, `practice-hq.spec.ts`, … | e2e: 3 spec(s) incl. real-stack; illustrated by `slice7-hq-missions` | PASS |
| FR-25 | Practice | practice-flow | backend, frontend | e2e | 2: `PracticeIT.kt`, `PracticeRulesTest.kt` | 5: `HqScreen.test.tsx`, `MissionScreen.test.tsx`, `practice-hq.spec.ts`, … | e2e: 3 spec(s) incl. real-stack; illustrated by `slice7-hq-missions`, `slice7-start-two-clicks` | PASS |
| FR-26 | Practice | practice-flow | backend, frontend | e2e | 3: `PracticeApiTest.kt`, `PracticeIT.kt`, `PracticeRulesTest.kt` | 6: `practice.test.ts`, `TaskScreen.test.tsx`, `practice-task.spec.ts`, … | e2e: 4 spec(s) incl. real-stack; illustrated by `slice7-start-two-clicks`, `slice7-correct-next` | PASS |
| FR-27 | Practice | practice-flow | backend, frontend | local-verifiable, e2e | 3: `PracticeApiTest.kt`, `PracticeIT.kt`, `PracticeRulesTest.kt` | 5: `practice.test.ts`, `TaskScreen.test.tsx`, `practice-task.spec.ts`, … | lv: unit/IT green (AV-latest both repos); e2e: 3 spec(s) incl. real-stack; illustrated by `slice7-correct-next`, `slice7-wrong-then-reveal` | PASS |
| FR-28 | Practice | practice-flow | backend, frontend | e2e | 1: `PracticeIT.kt` | 3: `TaskScreen.test.tsx`, `practice-help.spec.ts`, `practice.spec.ts` | e2e: 2 spec(s) incl. real-stack; illustrated by `slice7-hints-translation` | PASS |
| FR-29 | Practice | practice-flow | backend, frontend | e2e | 2: `PracticeApiTest.kt`, `PracticeIT.kt` | 2: `TaskScreen.test.tsx`, `practice-help.spec.ts` | e2e: 1 spec(s); illustrated by `slice7-hints-translation` | PASS |
| FR-30 | Practice | practice-flow | backend, frontend | e2e | 2: `PracticeIT.kt`, `PracticeRulesTest.kt` | 3: `TaskScreen.test.tsx`, `practice-help.spec.ts`, `flag-queue.spec.ts` | e2e: 2 spec(s) incl. real-stack; illustrated by `slice7-report` | PASS |
| FR-31 | Practice | practice-flow | backend, frontend | e2e | 1: `PracticeIT.kt` | 3: `practice.test.ts`, `TaskScreen.test.tsx`, `practice-resume.spec.ts` | e2e: 1 spec(s); illustrated by `slice7-save-resume` | PASS |
| FR-32 | Practice | gamification | backend, frontend | e2e, recording | 3: `GamificationIT.kt`, `GamificationRulesTest.kt`, `GamificationServiceTest.kt` | 4: `SummaryScreen.test.tsx`, `TaskScreen.test.tsx`, `gamification-summary.spec.ts`, … | e2e: 2 spec(s) incl. real-stack; rec: `slice8-mission-complete`, `slice8-mission-complete-rankup`, `slice8-replay` | PASS |
| FR-33 | Practice | gamification | backend, frontend | local-verifiable | 2: `GamificationIT.kt`, `GamificationRulesTest.kt` | 4: `MissionScreen.test.tsx`, `SummaryScreen.test.tsx`, `TaskXp.test.tsx`, … | lv: unit/IT green (AV-latest both repos); illustrated by `slice8-replay` | PASS |
| FR-34 | Game | gamification | backend | local-verifiable | 5: `GamificationConfigIT.kt`, `GamificationConfigTest.kt`, `GamificationIT.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-35 | Game | gamification | backend | local-verifiable | 5: `GamificationConfigIT.kt`, `GamificationConfigTest.kt`, `GamificationIT.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-36 | Game | gamification | backend, frontend | local-verifiable, vision-verify | 5: `GamificationConfigIT.kt`, `GamificationConfigTest.kt`, `GamificationIT.kt`, … | 7: `HqProgress.test.tsx`, `RankUp.test.tsx`, `SummaryScreen.test.tsx`, … | lv: unit/IT green (AV-latest both repos); vision: `slice8-rankup-hq`, `slice8-rankup-reduced-motion`, `slice8-rankup-task`, `slice8-mission-complete-rankup` | PASS |
| FR-37 | Game | gamification | backend, frontend | e2e, vision-verify | 3: `GamificationConfigIT.kt`, `GamificationIT.kt`, `GamificationRulesTest.kt` | 5: `HqProgress.test.tsx`, `rank.test.ts`, `gamification-hq.spec.ts`, … | e2e: 3 spec(s) incl. real-stack; vision: `slice8-hq-progress`, `slice8-hq-top-rank` | PASS |
| FR-38 | Game | gamification | backend, frontend | local-verifiable | 2: `GamificationIT.kt`, `GamificationRulesTest.kt` | 3: `HqProgress.test.tsx`, `TaskXp.test.tsx`, `gamification-hq.spec.ts` | lv: unit/IT green (AV-latest both repos); illustrated by `slice8-rankup-task`, `slice8-mission-complete` | PASS |
| FR-39 | Game | gamification | backend, frontend | local-verifiable | 3: `GamificationConfigIT.kt`, `GamificationConfigTest.kt`, `GamificationServiceTest.kt` | 1: `denylist.test.ts` | lv: unit/IT green (AV-latest both repos); illustrated by `rec-skin-hq` | PASS |
| FR-58 | Game | platform-foundation | frontend | a11y, e2e | n/a | 2: `theme-source.test.ts`, `theme.spec.ts` | a11y: light+dark passed; e2e: 1 spec(s); illustrated by `rec-theme-light`, `rec-theme-dark` | PASS |
| FR-40 | Stats | progress-stats | backend, frontend | e2e | 3: `FlagQueueServiceTest.kt`, `ProgressStatsIT.kt`, `StatsRulesTest.kt` | 5: `AdminLayout.test.tsx`, `stats.test.ts`, `StatsScreen.test.tsx`, … | e2e: 2 spec(s) incl. real-stack; illustrated by `rec-stats` | PASS |
| FR-41 | Stats | progress-stats | backend, frontend | e2e | 4: `FlagQueueIT.kt`, `FlagQueueServiceTest.kt`, `PracticeLogCaptureIT.kt`, … | 4: `AdminLayout.test.tsx`, `ReportsScreen.test.tsx`, `flag-queue.spec.ts`, … | e2e: 2 spec(s) incl. real-stack; illustrated by `rec-flag-queue` | PASS |
| FR-42 | Stats | practice-flow | backend | local-verifiable | 1: `PracticeIT.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-43 | Settings | child-profile | backend | local-verifiable | 7: `ChildProfileStartupIT.kt`, `ChildProfileStartupTest.kt`, `DisplayNamePolicyTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| FR-44 | Settings | practice-flow | backend | local-verifiable | 4: `PracticeApiTest.kt`, `PracticeIT.kt`, `TutorSwapTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-1 | Security | admin-access | backend | local-verifiable | 6: `AdminCredentialsTest.kt`, `AdminSessionIT.kt`, `AdminSessionTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-2 | Security | platform-foundation | backend | local-verifiable | 4: `DouckoBackendApplicationIT.kt`, `BindAddressTest.kt`, `ComposeConfigurationTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-3 | Privacy | platform-foundation | backend, frontend | local-verifiable | 14: `AdminSessionIT.kt`, `ContentAuthoringIT.kt`, `DouckoBackendApplicationIT.kt`, … | 1: `app-shell.spec.ts` | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-4 | Legal | platform-foundation | backend, frontend | local-verifiable | 2: `E2eStackToolTest.kt`, `FixtureProvenanceTest.kt` | 1: `provenance.test.ts` | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-5 | Performance | practice-flow | backend, frontend | local-verifiable, e2e | 2: `CheckerTimingTest.kt`, `PracticeTimingIT.kt` | 2: `navigation.test.tsx`, `practice-timing.spec.ts` | lv: unit/IT green (AV-latest both repos); e2e: 1 spec(s) | PASS |
| NFR-6 | Compatibility | platform-foundation | frontend | e2e | n/a | 3: `admin-sign-in.spec.ts`, `app-shell.spec.ts`, `admin-session.spec.ts` | e2e: 3 spec(s) incl. real-stack | PASS |
| NFR-7 | Usability | practice-flow | frontend | e2e | n/a | 7: `App.test.tsx`, `navigation.test.tsx`, `HqScreen.test.tsx`, … | e2e: 2 spec(s); illustrated by `slice7-hq-missions`, `slice7-start-two-clicks`, `slice7-correct-next` | PASS |
| NFR-8 | Usability | authoring-tasks | frontend | recording | n/a | 2: `TaskEditorScreen.test.tsx`, `authoring-tasks.spec.ts` | rec: `nfr8-single-part-task-entry` | PASS |
| NFR-9 | Localization | platform-foundation | backend, frontend | local-verifiable | 2: `DouckoBackendApplicationIT.kt`, `UndeclaredPathTest.kt` | 7: `i18n-coverage.test.tsx`, `AdminGate.test.tsx`, `AdminLayout.test.tsx`, … | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-10 | Reliability | platform-foundation | backend | local-verifiable | 4: `BackupRestoreIT.kt`, `ComposeConfigurationTest.kt`, `E2eStackToolTest.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-11 | Maintainability | platform-foundation | backend | local-verifiable | 2: `ModularityTest.kt`, `PackageLayoutTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-12 | API | platform-foundation | backend, frontend | local-verifiable | 1: `ContractGenerationTest.kt` | 2: `contract-client.test.ts`, `container-config.test.ts` | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-13 | Accessibility | platform-foundation | frontend | a11y | n/a | 2: `routes.test.ts`, `a11y.spec.ts` | a11y: light+dark passed; illustrated by `slice8-rankup-reduced-motion` | PASS |
| NFR-15 | Security | admin-access | backend | local-verifiable | 4: `AdminIdleTimeoutFilterTest.kt`, `AdminIdleTimeoutTest.kt`, `AdminSessionIT.kt`, … | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-16 | Security | admin-access | backend | local-verifiable | 2: `AdminPasswordPolicyTest.kt`, `AdminStartupTest.kt` | n/a | lv: unit/IT green (AV-latest both repos) | PASS |
| NFR-17 | Reliability | authoring-tasks | backend, frontend | local-verifiable | 8: `ContentAuthoringIT.kt`, `SourceApiTest.kt`, `SourceRulesTest.kt`, … | 5: `SourcesScreen.test.tsx`, `upload-limits.test.ts`, `TaskEditorScreen.test.tsx`, … | lv: unit/IT green (AV-latest both repos) | PASS |

## Group → manual test cases

| Group | Requirements | Manual cases (`manual-test-plan.md`) |
|---|---|---|
| Content | FR-1..13, FR-55..57 | MT-01..MT-06 |
| Checking | FR-14..23 | MT-07 |
| Practice | FR-24..33 | MT-08..MT-10 |
| Game | FR-34..39, FR-58 | MT-11, MT-12 |
| Stats | FR-40..42 | MT-13, MT-14 |
| Settings | FR-43, FR-44 | MT-15 |
| NFRs | NFR-1..13, 15..17 | MT-16..MT-19 (plus the automated evidence above) |

Empty "n/a" cells mean the repo does not own the requirement per `docs/mvp-capability-plan.md` §5; they are not gaps.
