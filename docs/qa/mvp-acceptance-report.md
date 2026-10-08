# MVP Acceptance Report — Doučko (Phase 6, QA proof)

- Written: 2026-10-08 (Europe/Prague) by the `qa-documenter` role. Not yet signed.
- Pins: docs `b920bea` (+ this commit), backend `main` `26648ee`, frontend `main` `a8aeb06`.
- Per-requirement detail: `requirements-traceability-matrix.md`. Risks: `risk-register.md`. Manual cases: `manual-test-plan.md`. Demo walkthrough: `demo-script.md`.
- Code-repo paths are relative to this repo (`../backend`, `../frontend`).

## 1. Executive summary

All 64 MVP requirements (48 FR, 16 NFR) have owner-repo `@trace` tests and an artifact for every declared verification method. Deterministically they all read **PASS** (`docs/qa/workspace-traceability-report.md`, `requirements-traceability-matrix.md`).

The MVP is **not yet ready to sign off as done**, for these reasons:

- G1 and G3 still need owner sign-off (every repo's gate view).
- One process correction (COR-1) has no disposition.
- 11 clips have no current vision verdict.
- The CI `e2e-stack` job has never run.
- G6 is SKIP-planned, not PASS, because no MVP requirement uses `eval`.

## 2. Verdict per requirement group

| Group | Requirements | n | PASS | NOT-EARNED | Deciding evidence |
|---|---|---|---|---|---|
| Content authoring | FR-1..13, FR-55, FR-56, FR-57 | 16 | 16 | 0 | backend + frontend batteries; `../frontend/docs/qa/e2e-stack-latest.md`; slice6 clips (current vision verdicts) |
| Answer checking | FR-14..23 | 10 | 10 | 0 | backend battery `../backend/docs/qa/automated-verification-latest.md`; `../backend/docs/qa/evidence/slice3-checker-run.md`; FR-22 e2e + `slice7-unparseable` |
| Practice | FR-24..33 | 10 | 10 | 0 | e2e (mocked + real-stack); slice7 clips; FR-32 asserted clips `slice8-mission-complete`, `slice8-mission-complete-rankup`, `slice8-replay` |
| Game | FR-34..39, FR-58 | 7 | 7 | 0 | backend battery; FR-36/FR-37 slice8 vision verdicts (current); FR-58 `../frontend/docs/qa/a11y-report.json` |
| Stats | FR-40..42 | 3 | 3 | 0 | e2e; `../backend/docs/qa/evidence/slice9-compose-smoke.md` |
| Settings | FR-43, FR-44 | 2 | 2 | 0 | backend battery |
| Security | NFR-1, NFR-2, NFR-15, NFR-16 | 4 | 4 | 0 | backend tests (`AdminSessionIT`, `BindAddressTest`, `AdminIdleTimeoutTest`, `AdminPasswordPolicyTest`); `../frontend/docs/qa/container-smoke-latest.md` |
| Privacy / Legal | NFR-3, NFR-4 | 2 | 2 | 0 | `FixtureProvenanceTest`, `provenance.test.ts`, `e2e/app-shell.spec.ts` |
| Performance | NFR-5 | 1 | 1 | 0 | `CheckerTimingTest`, `PracticeTimingIT`, `e2e/practice-timing.spec.ts` (dev machine) |
| Compatibility | NFR-6 | 1 | 1 | 0 | Playwright projects chromium + msedge + firefox at 1280x720 (`../frontend/playwright.config.ts`, `../frontend/playwright.stack.config.ts`) |
| Usability | NFR-7, NFR-8 | 2 | 2 | 0 | slice7 clips (vision met); NFR-8 timed clip `nfr8-single-part-task-entry` (asserted, vision met) |
| Localization | NFR-9 | 1 | 1 | 0 | `i18n-coverage.test.tsx`, `UndeclaredPathTest` |
| Reliability | NFR-10, NFR-17 | 2 | 2 | 0 | `BackupRestoreIT`; `../backend/docs/qa/evidence/fix-restore-schema-drift.md`; upload-limit tests |
| Maintainability / API | NFR-11, NFR-12 | 2 | 2 | 0 | `ModularityTest`, `ContractGenerationTest`, `contract-client.test.ts` |
| Accessibility | NFR-13 | 1 | 1 | 0 | `../frontend/docs/qa/a11y-report.json` (15 routes x light + dark, 0 failures) |
| **Total** | | **64** | **64** | **0** | |

"PASS" here is the deterministic verdict only. The judgment gates in §3 sit on top of it.

## 3. Gate status (`npm run -s gate:status`, read-only, 2026-10-08)

| Gate | backend `26648ee` | frontend `a8aeb06` | docs `b920bea` | Notes |
|---|---|---|---|---|
| G1 requirements | **needs sign-off** | **needs sign-off** | **needs sign-off** | The owner still has to sign off (judgment gate), in all three repos. |
| G3 plan | **needs sign-off** | **needs sign-off** | **needs sign-off** | `docs/qa/checkpoint-2-plan-signoff.md` records the checkpoint-2 approval, but every gate view still asks for owner confirmation. |
| G4 per-slice | PASS | PASS | SKIP-pending | |
| G5 hardening | PASS (coverage only) | PASS (`e2eStack` Scope 21, coverage Scope 4) | n/a (docs role) | Coverage baselines: `../frontend/quality/coverage-baseline.json` (100/100/100/100), `../backend/quality/coverage-baseline.json` (lines 99.3, branches 91.14). |
| G6 QA proof | PASS | **SKIP-planned** | SKIP-pending | `evals` is SKIP-planned with Scope 0 because no MVP requirement declares `eval`. Only the Future rows FR-45..49 and FR-51 do (FR-47 also declares e2e). This is **not** counted as PASS. No `eval-report.md` was generated, because there is nothing to grade. |
| G7 release | PASS | PASS (deterministic) | SKIP-pending | Phase 7 has not started. |
| G8 UAT | PASS | PASS | PASS | Trace-regression check only; no UAT has been done. |
| **Summary** | PASS | **FAIL** | PASS | The frontend is FAIL because COR-1 is open: no gate may show a green summary while a correction is open. |

Batteries:

- Frontend: `../frontend/docs/qa/automated-verification-latest.md` (finished 2026-10-08T20:42Z at `2683a5b`): Pass. `eval-ratchet` reads PLANNED.
- Backend: `../backend/docs/qa/automated-verification-latest.md` (finished 2026-10-08T05:53Z): Pass, but it was recorded at `5913aa2`. `26648ee` adds only the PD-16 factory install (`c3a0454`) and the merge. There is no battery run recorded at `26648ee`.
- Docs: `gate:status` shows `processRatchet` as NOT-EARNED (experimental, Scope 2). It is not a hard check; it is listed here so it is not hidden.

## 4. Real-stack, compose and deploy-sensitive evidence

- **Real-stack Playwright, no mocks:** `../frontend/docs/qa/e2e-stack-latest.md`. 21 passed, 0 failed/flaky/skipped, PASS, frontend `2683a5b` against backend `26648ee`. Run logs: `../frontend/docs/qa/evidence/phase5-e2e-stack-runs.md`, `../backend/docs/qa/evidence/phase5-e2e-stack.md`.
- **Per-slice compose smokes** (manual, real stack):
  - backend `../backend/docs/qa/evidence/slice{1,2,4,5,6,7,8,9}-compose-smoke.md`
  - frontend `../frontend/docs/qa/evidence/slice{1,2,5}-compose-smoke.md`
  - Slice 3 (the checker, no UI) has `../backend/docs/qa/evidence/slice3-checker-run.md` instead.
- **nginx container smoke:** `../frontend/docs/qa/container-smoke-latest.md`, 19/19 PASS. It ran on 2026-10-04 at frontend `43f1267`, which is older than HEAD, and it was not re-run in Phase 6.

### Deploy-gated / environment-sensitive NFRs

No MVP requirement carries the `deploy-gated` tag; the tag appears only in the vocabulary table of `docs/requirements.md`. The deployment target is the owner's own laptop on the LAN. The NFRs that depend on that environment are proved locally only. None of them is claimed as verified on the target.

| NFR | Evidence that exists | Evidence that does NOT exist |
|---|---|---|
| NFR-2 localhost/LAN only | `BindAddressTest`, `ComposeConfigurationTest`; container smoke (localhost and a LAN address are served, a foreign host name is refused) | No check on the owner's real network; nothing has probed for exposure from outside. |
| NFR-5 p95 < 300 ms, load < 1.5 s | `CheckerTimingTest`, `PracticeTimingIT`, `e2e/practice-timing.spec.ts` on the dev machine | No measurement on the owner's laptop with real data. |
| NFR-6 Chrome, Edge, Firefox | Playwright chromium/msedge/firefox at 1280x720 | No run in the browsers installed on the owner's laptop. |
| NFR-10 backup on Windows | `BackupRestoreIT`; `npm run backup` in `../backend/docs/qa/evidence/slice1-compose-smoke.md`; restore proof `../backend/docs/qa/evidence/fix-restore-schema-drift.md` | Ongoing backups are an owner process and are not verified. |

## 5. Scope NOT delivered

- **Future requirements FR-45..54 and NFR-14** (AI tutoring and generation, multi-user, OpenAI budget): not built and not tested. FR-45..49 and FR-51 are the only requirements verified by `eval`. As a result there is no eval suite, no `eval-report.md`, and G6 is SKIP-planned.
- **Vision verdicts for the 11 `phase6-admin-theme` clips:** `rec-source-upload`, `rec-pdf-beside-editor`, `rec-task-images`, `rec-parts-hints-translations`, `rec-preview-tester`, `rec-task-list-provenance`, `rec-skin-hq`, `rec-stats`, `rec-flag-queue`, `rec-theme-light`, `rec-theme-dark`.
  - They were re-recorded after review. Their earlier verdicts are superseded, and they have **not been re-judged** (see the banner in `../frontend/docs/qa/vision-report.md`).
  - No MVP row depends on them for a declared method; they only illustrate.
- **CI `e2e-stack` job** (`../frontend/.github/workflows/ci.yml`): it has never run. Remote `origin` repositories are configured, but nothing after 2026-10-04 has been pushed:
  - frontend `main` is 43 commits ahead of `origin/main` `c0daadc`
  - backend `main` is 41 commits ahead of `origin/main` `568ae63`
  - docs `main` is 8 commits ahead of `origin/main` `b6dd69a`

  The job was added with PD-16 and also needs the `DOUCKO_BACKEND_REPO` repository variable. All real-stack evidence is local.
- **Install on the owner's machine:** not verified as part of Phase 6 (see the §4 table).
- **Release (G7) and UAT with the child:** not started.

## 6. Open items (the owner's unless stated)

1. Sign off G1 and G3 (`gate:status` shows "needs sign-off" in backend, frontend and docs).
2. Disposition COR-1 (`../frontend/retro/corrections/001-auto-waiver-created-docs-qa-waivers-slice1-task-.correction.json`). It was raised automatically by the slice-1 waiver `../frontend/docs/qa/waivers/slice1-task-2.8-red-run.md`. Until it has a disposition, the frontend gate summary stays FAIL.
3. Re-run vision-verify over the 11 `rec-*` clips (frontend).
4. Push, then run CI including `e2e-stack` (set `DOUCKO_BACKEND_REPO` first). Pushing is the owner's decision.
5. Bump the `contract/` pins in backend and frontend. Both are at `0168ebab` while docs is ahead (see the warnings in `docs/qa/workspace-traceability-report.md`). Only docs-only commits are behind; the contract has not changed.
6. Before G7, re-run the backend battery at `26648ee` and the nginx container smoke at frontend HEAD.
7. Triage the advisories in `../frontend/docs/qa/vision-report.md` (nav highlight on Edit pages, PDF page mismatch in one still, low-contrast decorative dots). They are not blockers.

## 7. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Owner | | | |
