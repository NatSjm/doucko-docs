# PD-10 / PD-11 — slice-scoped gates and the a11y artifact (proof)

Approved by the product owner in chat on 2026-10-03 ("Scope to built
slices"). Found while verifying slice 1 (`platform-foundation`) in the
frontend.

## Red (frontend, before the fix)

`npm run qa:verify` stopped at `acceptance-artifacts`, so lint, typecheck,
unit, e2e and build never ran:

```
acceptance (artifact): 48 contract(s) across 40 requirement(s) — 18 failure(s), 0 warning(s), 0 pending
Result: FAIL
Overall result: Fail
```

The 18 failures were requirements of slices 2–9 (FR-1, FR-22, FR-32, FR-36,
NFR-17 …). Slice 1's own FR-58 and NFR-13 also failed, because nothing wrote
the a11y artifact (PD-11). After that fix, recordings, eval-ratchet and
trajectory were NOT-EARNED in every Phase 4 run (`SKIP-pending` flipped by
product code), and the process ratchet failed on 5 "vacuous passes" that
`qa-verify` had in fact classified NOT-EARNED or PLANNED.

## Fix

- `lib/factory-config.mjs`: `parsePlanSlices`, `startedSlices`, `ownership().sliceOf/sliceStarted`, `declaredMethodIds`.
- `check-acceptance-methods.mjs`: artifact mode audits only requirements of
  started slices. The others print `PLANNED [id]`. The result is PASS when at
  least one audited contract exists and none fails, and `SKIP-planned` when
  nothing is due. `--release` disables the scoping.
- `check-recordings.mjs`, `check-eval-ratchet.mjs`, `check-vision.mjs`: zero
  evidence is `SKIP-planned` when no started slice declares the method.
- `check-trajectory.mjs`: no archived slice while an `implement-*` change is
  in progress is `SKIP-planned` (`--release` stays strict).
- `qa-verify.mjs` / `gate-status.mjs`: `SKIP-planned` is shown as PLANNED,
  never PASS, never flipped to NOT-EARNED. A gate with a PLANNED member is
  never PASS (severity just above PASS).
- `ledger-report.mjs`: a vacuous pass is a zero-scope run *rendered* as a
  pass. Runs classified NOT-EARNED, SKIP-pending, PLANNED or FAIL are not.
- PD-11 `check-a11y.mjs`: writes `docs/qa/a11y-report.json`, finds routes in
  `src/app/route-paths.ts`, serves `dist/` itself and stops the server tree
  on Windows. Frontend installs `@axe-core/playwright`.

## Green (frontend, 2026-10-03)

```
acceptance (artifact): 48 contract(s) across 40 requirement(s) — 0 failure(s), 0 warning(s), 0 pending, 16 planned
Result: PASS
Overall result: Pass (3 member(s) PLANNED, not yet due: trajectory, recordings, eval-ratchet)
```

The in-scope contracts of slice 1 resolve to real artifacts: FR-58 →
`docs/qa/a11y-report.json` + `test-results/.last-run.json`; NFR-3, 4, 9, 12
→ `@trace` tests; NFR-6 → e2e; NFR-13 → the a11y report.

Strictness kept:

```
node scripts/check-acceptance-methods.mjs --mode=artifact --release
acceptance (artifact): … — 16 failure(s), 0 warning(s), 0 pending, 0 planned
Result: FAIL
```
