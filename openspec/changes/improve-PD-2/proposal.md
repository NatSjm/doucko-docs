# Improvement Proposal: improve-PD-2

- **Defect:** PD-2 (`docs/qa/process-defects.json`). The Phase 0 boundary digest sees only the docs repo. None of the backend or frontend gate runs, where the Phase 0 work happened, reach the ledger digest or the process-auditor, and `productCodePresent` is structurally false.
- **Class / severity:** missing-check / P1
- **Status:** draft

## Scope

**Changes:** the docs-repo ledger digest joins the sibling repos' ledgers
when they exist.

**Does NOT change:**
- per-repo ledgers or their writers
- `check-workspace` (the G3 requirement join)
- any gate threshold

Alternative fix, left for the human to choose: change the auditor dispatch
contract so that a phase-boundary audit dispatches one auditor per repo.
That is a text change to the agent definition source, and it would be a
separate proposal. The auditor recommends the deterministic join, because
a digest is data and a dispatch rule is prose.

## Target file

`factory/scripts/ledger-report.mjs`. This is **presumed**: it is the source
of the installed `scripts/ledger-report.mjs` named in
`docs/qa/process-health.md:3`. The auditor did not open or list it, because
it is outside the read set. The orchestrator must confirm the path.

## Exact diff

**NOT DRAFTED.** The target file is outside the auditor's read set, so an
exact diff would be invented. The required behaviour, for the orchestrator
to turn into the diff this proposal must carry before approval:

1. In the docs repo, when `../backend/trace/ledger.jsonl` and/or
   `../frontend/trace/ledger.jsonl` exist, read them as well. Tag each event
   with its repo, and report per-repo rows in the retries/latency table.
2. Compute `productCodePresent` across all three repos from the configured
   `productCode` paths (backend `src/main/`, frontend `src/` minus
   `src/design-system/`), per repo, rather than from the docs repo alone.
3. After G0, a missing sibling ledger renders as `NOT-EARNED: ledger for
   <repo> not found`. It is never silently omitted, and never PASS.
4. `Inputs` lists every ledger joined, with event counts per repo.

## Expected metric movement

- **Metric:** `ledger.eventCount` (repos joined) and `productCodePresent`.
- **Current:** 14 events from the docs repo only. `productCodePresent: false`
  (`trace/process-health.json:9`).
- **Expected after fix:** repos joined 1 -> 3. `productCodePresent` false ->
  true once backend `src/main/` exists. The backend Maven launcher failures
  (COR-1) show up in `retriesPerCheck` rather than only in a hand-copied
  evidence file.
- **Verified by:** the NEXT retro reads the same metric. **No movement =
  auto-flag this improvement for revert.**

## EXECUTED red→green proof

**No executed proof exists.** Nothing has been run for this defect. Proof
plan, which must be EXECUTED and pasted here before approval:

- **Red fixture:** `tests/fixtures/ledger-report/red/`, a docs-shaped tree
  with sibling `backend/trace/ledger.jsonl` (containing a failing `mvnw`
  event) and `backend/src/main/App.kt`. The current ledger-report reports
  `productCodePresent: false` and 0 backend events, and the test must fail
  on that.
- **Green fixture:** the same tree. The patched ledger-report reports
  `productCodePresent: true`, the backend events and the failing check.
- **Test:** `node tests/ledger-report.test.mjs`

```text
<not executed — paste real output here before approval>
```

## Rollback (one revert)

- **Single commit:** yes, `git revert <sha>`.
- **State to clean up on revert:** regenerate `docs/qa/process-health.md` and
  `trace/process-health.json` with the reverted script.
- **Ladder position:** experimental.

## Approval & trailer convention

- Human approver: `<name>` · Date: `<YYYY-MM-DD>`
- Commit message MUST end with the trailer line: `Refs: PD-2`
