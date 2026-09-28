# Improvement Proposal: improve-PD-3

- **Defect:** PD-3 (`docs/qa/process-defects.json`). `check-process-ratchet` renders NOT-EARNED with exit 0 when both of its guards are SKIP-pending pre-product. Its Scope count (1) does not match the guards it lists (2). The only way it offers to earn a pass is `--update`, which writes a baseline over empty scope.
- **Class / severity:** label-drift / P1
- **Status:** draft

## Scope

**Changes:** the ratchet's result label, its exit code and scope count, and
a refusal on `--update` over empty scope.

**Does NOT change:**
- the guards themselves (vacuous-pass guard, dead-@trace guard)
- how qa-verify folds members

Dependency: land **PD-4 before or together with this change**. Once the
ratchet stops being NOT-EARNED pre-product, the openspec rows that render
PASS over zero items (PD-4) are the only thing left carrying "PASS"
weight in the docs battery.

## Target file

`factory/scripts/check-process-ratchet.mjs`. This is **presumed**: it is the
source of the installed `scripts/check-process-ratchet.mjs` named in
`docs/qa/automated-verification-latest.md:16`. The auditor did not open it,
because it is outside the read set.

## Exact diff

**NOT DRAFTED.** The target file is outside the auditor's read set.
Required behaviour, to be turned into the exact diff before approval:

1. Product code absent and every guard SKIP-pending: print
   `Result: SKIP-pending`, exit 0.
2. Product code present and no baseline: print `Result: NOT-EARNED`, exit
   **non-zero**. NOT-EARNED must never exit 0.
3. `--update` refuses (non-zero exit, clear message) while any guard is
   SKIP-pending or at scope 0. A baseline may only record a truthful,
   non-empty green run.
4. `Scope: N guard(s)` equals the number of guards evaluated (2 in the
   current output, lines 83-84).

## Expected metric movement

- **Metric:** `notEarned.count` and qa-verify `stillRed`
  (`trace/process-health.json`).
- **Current:** notEarned 1; qa-verify stillRed true (docs repo, Phase 0).
- **Expected after fix:** pre-product, notEarned 1 -> 0 and stillRed true ->
  false. Post-product with no baseline, NOT-EARNED with a non-zero exit. No
  baseline file is ever written at scope 0.
- **Verified by:** the NEXT retro reads the same metric. **No movement =
  auto-flag this improvement for revert.**

## EXECUTED red→green proof

**No executed proof exists.** Proof plan, to be executed and pasted here
before approval:

- **Red fixture:** `tests/fixtures/process-ratchet/red/`, a phase-0 tree with
  no product code, no digest and no `@trace`. The current script prints
  NOT-EARNED and exits 0, and the test must fail on that.
- **Green fixtures:**
  - the same tree gives SKIP-pending, exit 0
  - a tree with product code and no baseline gives NOT-EARNED, exit non-zero
  - `--update` on the empty tree exits non-zero and writes no baseline
- **Test:** `node tests/process-ratchet.test.mjs`

```text
<not executed — paste real output here before approval>
```

## Rollback (one revert)

- **Single commit:** yes, `git revert <sha>`.
- **State to clean up on revert:** none expected. If someone ran `--update`
  before the revert, remove any baseline written at scope 0.
- **Ladder position:** soft. This corrects the labels of an existing check;
  it adds no new check.

## Approval & trailer convention

- Human approver: `<name>` · Date: `<YYYY-MM-DD>`
- Commit message MUST end with the trailer line: `Refs: PD-3`
