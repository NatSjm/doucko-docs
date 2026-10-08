# Improvement Proposal: improve-PD-16

- **Defect:** PD-16 (`docs/qa/process-defects.json`). G5 has no mechanism for the frontend's real-stack Playwright verdict (frontend review-gate F12, critical): gate-status G5 keys were `["coverage"]`, the battery's `browser-e2e-tests` is the mocked suite, and `factory/ci/frontend.yml` promised compose-stack E2E "once Phase 5 wires it".
- **Class / severity:** declared-method-without-mechanism / P1
- **Status:** approved (landed in the commit carrying `Refs: PD-16`; requested by the coordinator 2026-10-08)

## Scope

**Changes:**
- New `factory/scripts/check-e2e-stack.mjs` (frontend role), the single
  implementation of the evidence check: reads `docs/qa/e2e-stack-latest.md`
  (written by the frontend's `npm run test:e2e:stack`) and passes only on a
  full run with `Result: PASS`, `Tests: n passed, 0 failed, 0 flaky,
  0 skipped` (n > 0), recorded at a clean frontend commit equal to HEAD or
  whose diff to HEAD touches only `docs/qa/` and `trace/`. Missing evidence is
  SKIP-pending before product code, NOT-EARNED after; stale, narrowed or
  dirty-tree evidence is NOT-EARNED; a recorded FAIL is FAIL.
- `gate-status`: G5 keys `coverage` + `e2eStack`; `GATE_COMMANDS` entries may
  carry `roles`, and other roles render the key `n/a (<repo> role)`.
- `install.mjs`: frontend installs the script and `check:e2e-stack`.
- Frontend config template: battery member `e2e-stack-evidence` (no Docker).
- `ci/frontend.yml`: job `e2e-stack` checks out backend + frontend and runs
  `npm run test:e2e:stack` with `DOUCKO_BACKEND_DIR`; stale comment fixed.
- GATES.md G5, PLAYBOOK Phase 5, RULES-CHANGELOG (rung + history row).

**Does NOT change:** the mocked `browser-e2e-tests` member; the backend or
docs gates (key is n/a there); already-seeded `factory.config.json` /
`ci.yml` files in existing repos (project-owned: add the battery member and
CI job by hand where wanted, in a `Refs: PD-16` commit).

## Expected metric movement

- **Metric:** frontend G5 checks consuming real-stack E2E evidence.
- **Current:** 0. **Expected:** 1 (`e2eStack`), plus the battery member.
- **Verified by:** `npm run gate:status` in the frontend prints an `e2eStack`
  row; the next retro reads it.

## EXECUTED red→green proof

`docs/qa/evidence/pd-16-e2e-stack-gate-proof.md`: committed (stale) evidence
→ NOT-EARNED; same evidence at HEAD or at a docs/qa+trace-only distance →
PASS; dirty, narrowed, zero-test and missing → NOT-EARNED; recorded failure
→ FAIL. Docs role → `n/a (docs role)`.
