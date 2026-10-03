# PD-9 — vision-verify had no executable mechanism (proof)

## Defect

FR-36 and FR-37 declare `vision-verify`. At G3,
`check-acceptance-methods --mode=existence` in the frontend failed:

```
FAIL  [FR-36] vision-verify: declares vision-verify but no mechanism exists (looked for npm scripts [check:vision] and files [scripts/check-vision.*])
FAIL  [FR-37] vision-verify: declares vision-verify but no mechanism exists (looked for npm scripts [check:vision] and files [scripts/check-vision.*])
acceptance (existence): 48 contract(s) across 40 requirement(s) — 2 failure(s), 0 warning(s), 0 pending
Result: FAIL
```

The harness installed the `vision-verify` workflow (the LLM judge) into the
frontend, but no `check:vision` script and no `scripts/check-vision.*`, so the
declared method had no gate. A second fault sat behind it. The artifact globs
for `vision-verify` included `docs/qa/vision-report.md`, which the workflow
writes as a table with no `met:` line. Artifact mode evaluates every match
and a failing one vetoes, so even a fully met run would have failed.

## Fix (factory source, re-installed)

- `factory/scripts/check-vision.mjs` (new). A deterministic gate over the
  workflow's verdicts in `docs/qa/**/manifest.json`. It writes
  `docs/qa/vision-report.json`, with `met: true` only when every owned
  requirement that declares vision-verify has a recorded clip whose
  screenshot exists and whose verdict is met and readable. Three-valued:
  SKIP-pending, NOT-EARNED, FAIL, PASS. `--run` runs the workflow first.
- `factory/install.mjs`: the frontend role installs `check-vision` and the
  npm script `check:vision`.
- `factory/scripts/check-acceptance-methods.mjs`: the `vision-verify`
  artifact is only `docs/qa/vision-report.json`.

## Green (frontend, 2026-10-03)

```
acceptance (existence): 48 contract(s) across 40 requirement(s) — 0 failure(s), 0 warning(s), 0 pending
Result: PASS
```

Gate branches, exercised with a throwaway manifest under
`docs/qa/pd9-probe/` (removed afterwards):

| Case | Result | Exit |
|---|---|---|
| no recorded clip, product code present | NOT-EARNED | 1 |
| FR-36 and FR-37 clips met and readable | PASS (`vision-report.json` `met: true`) | 0 |
| a clip with `met: false` | FAIL | 1 |
| a clip whose screenshot file is missing | FAIL | 1 |

`check:vision` is not part of `qa:verify`. Until slice 8 (`gamification`)
records FR-36 and FR-37, artifact mode reports their vision-verify as
missing, which is the honest state.
