# Risk Register — MVP (Phase 6)

Written 2026-10-08 (Europe/Prague). Paths are relative to this repo; `../backend` and `../frontend` are the sibling repos.

| # | Risk | Likelihood | Impact | Mitigation / evidence | Owner | Status |
|---|---|---|---|---|---|---|
| R-1 | Real-stack E2E has only run locally and the CI job has never run, so a regression after a push could go unnoticed | Medium | Medium | Local PASS in `../frontend/docs/qa/e2e-stack-latest.md`. The CI job in `../frontend/.github/workflows/ci.yml` needs a push and the `DOUCKO_BACKEND_REPO` variable | Owner | Open |
| R-2 | 11 admin/theme clips have no current vision verdict | Medium | Low | The clips are asserted (`../frontend/docs/qa/recordings-report.md`). Re-run vision-verify | Frontend | Open |
| R-3 | The original slice-1 frontend tests were never seen failing (RED) first; this was waived | Low | Low | Waiver `../frontend/docs/qa/waivers/slice1-task-2.8-red-run.md`; RED runs of the review-fix tests in `../frontend/docs/qa/evidence/slice1-review-fixes.md`. COR-1 still needs a disposition | Owner | Open (COR-1) |
| R-4 | Performance or browser behaviour on the owner's laptop differs from the dev machine (NFR-5, NFR-6) | Low | Medium | Timing tests and 3-browser Playwright runs; manual case MT-18 on the target laptop | Owner | Open |
| R-5 | Data loss on the owner's laptop (Docker volume) | Low | High | Backup and restore are proven (`BackupRestoreIT`, `../backend/docs/qa/evidence/fix-restore-schema-drift.md`). The owner must still back up regularly | Owner | Mitigated (backup routine open) |
| R-6 | The stack is reachable from outside the LAN (NFR-2) | Low | High | `BindAddressTest`; the container smoke refuses foreign host names (`../frontend/docs/qa/container-smoke-latest.md`). The router configuration is untested | Owner | Mitigated locally |
| R-7 | Copyrighted workbook content or the child's personal data gets committed (NFR-3, NFR-4) | Low | High | The pre-commit hook refuses PDFs and runtime data; `FixtureProvenanceTest`, `provenance.test.ts` | All repos | Mitigated |
| R-8 | Contract pins lag docs HEAD | High | Low | Only docs-only commits since `0168ebab`; warnings in `docs/qa/workspace-traceability-report.md` | Docs | Open (bump before G7) |
| R-9 | The backend battery evidence is older than backend HEAD (`5913aa2` vs `26648ee`) | Medium | Low | The difference is the factory install and the merge only. Re-run before G7 | Backend | Open |
| R-10 | The nginx container smoke is older than frontend HEAD (`43f1267`) | Medium | Low | The real-stack E2E at `2683a5b` goes through the nginx image. Re-run `npm run test:container` before G7 | Frontend | Open |
