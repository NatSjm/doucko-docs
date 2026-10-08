# PD-16 proof: G5 consumes the real-stack E2E verdict (check-e2e-stack)

- Defect: review-gate finding F12 (critical) on frontend `harden-phase5-ui`: G5 had no
  mechanism for the real-stack Playwright suite. `gate-status` G5 keys were `["coverage"]`,
  the battery's `browser-e2e-tests` is the mocked suite, and `factory/ci/frontend.yml` said
  "E2E runs against the compose stack once Phase 5 wires it".
- Fix: `factory/scripts/check-e2e-stack.mjs` (one implementation) is the frontend G5 key
  `e2eStack` and the battery member `e2e-stack-evidence`; CI job `e2e-stack` runs
  `npm run test:e2e:stack` with `DOUCKO_BACKEND_DIR`.
- Executed 2026-10-08 from `C:\projects\school-tutor\frontend-phase5-hardening` (HEAD
  `b45f261`, before the PD-16 install commit), source script
  `node ../docs/factory/scripts/check-e2e-stack.mjs [--file=<fixture>]`. Fixtures are the
  committed `docs/qa/e2e-stack-latest.md` (recorded at `c0d0c7c`) with one field changed.
  No Docker run was made for this proof.

| Case | Fixture change | Result | Exit |
|---|---|---|---|
| committed evidence | none (recorded at `c0d0c7c`; since then `docs/current-state.md` and `openspec/changes/harden-phase5-ui/{design.md,review-findings.json,tasks.md}` changed) | NOT-EARNED (stale: 4 paths outside docs/qa/ and trace/) | 1 |
| fresh at HEAD | commit `b45f261` | PASS, Scope 21 | 0 |
| fresh via docs/qa+trace-only diff | commit `7285fae` (diff to HEAD: `docs/qa/automated-verification-latest.md`, `trace/acceptance-contracts.json`) | PASS, Scope 21 | 0 |
| dirty tree | `b45f261 (working tree dirty)` | NOT-EARNED | 1 |
| narrowed run | `Playwright args: --project=chromium` | NOT-EARNED | 1 |
| recorded failure | `20 passed, 1 failed`, `Result: FAIL` | FAIL | 1 |
| zero tests | `0 passed, 0 failed, 0 flaky, 0 skipped` | NOT-EARNED, Scope 0 | 1 |
| missing file (product code present) | path does not exist | NOT-EARNED, Scope 0 | 1 |

Red→green: the committed evidence is red (stale), the same evidence at a commit whose diff
to HEAD is confined to `docs/qa/` and `trace/` is green. Role scoping: in the docs repo
`npm run gate:status` prints `G5 n/a (docs role)` and `e2eStack n/a (docs role)`
(the key carries `roles: ["frontend"]`, so seeded backend/docs configs need no edit).
