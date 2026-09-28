# Improvement Proposal: improve-PD-5

- **Defect:** PD-5 (`docs/qa/process-defects.json`). `check-traceability` and `check-trajectory` write "Result: PASS" into their committed reports at Scope 0. Only the qa-verify wrapper relabels them SKIP-pending, so any reader of the report files sees PASS over nothing.
- **Class / severity:** label-drift / P1
- **Status:** draft

## Scope

**Changes:** the Result headline, and the exit code at Scope 0, of the two
scripts. They are aligned with `check-acceptance-methods` and
`check-workspace`, which already print `Result: SKIP-pending`
(`docs/qa/automated-verification-latest.md:61`, `:73`).

**Does NOT change:**
- the checks' logic
- the warnings they emit
- how qa-verify folds members

## Target file

Two files, both **presumed** sources of installed scripts that the auditor
did not open:
- `factory/scripts/check-traceability.mjs`
- `factory/scripts/check-trajectory.mjs`

Why two files: the defect is one convention (PASS at Scope 0) applied the
same way in two scripts. If the approver prefers one file per commit, split
the change into two commits, each carrying `Refs: PD-5`. The integrity lock
must expect exactly these two files to drift.

## Exact diff

**NOT DRAFTED.** The target files are outside the auditor's read set.
Required behaviour:

1. At Scope 0 with product code absent: print and write
   `Result: SKIP-pending (<reason>)`, exit 0.
2. At Scope 0 with product code present: print and write
   `Result: NOT-EARNED`, exit non-zero.
3. The same result is written to `trace/trace.json` and `trace/trajectory.json`,
   if those files carry a result field. The auditor did not read them.

## Expected metric movement

- **Metric:** committed reports headlined PASS at Scope 0.
- **Current:** 2. `docs/qa/traceability-report.md:8` ("Result: PASS, 2
  warning(s)" under "Scope: 0 MVP functional requirements") and
  `docs/qa/trajectory-report.md:9` ("Result: PASS, 1 warning(s)" under
  "Scope: 0 archived slice(s).").
- **Expected after fix:** 2 -> 0.
- **Verified by:** the NEXT retro reads the same metric. **No movement =
  auto-flag this improvement for revert.**

## EXECUTED red→green proof

**No executed proof exists.** Proof plan, to be executed and pasted here
before approval:

- **Red fixtures:** `tests/fixtures/traceability/red/` (no
  `docs/requirements.md`) and `tests/fixtures/trajectory/red/` (no
  `openspec/changes/archive/`). The current scripts write `Result: PASS`,
  and the tests must fail on that.
- **Green fixtures:**
  - the same trees give `Result: SKIP-pending`, exit 0
  - variants with product code present give `Result: NOT-EARNED`, exit
    non-zero
  - a non-empty fixture still gives `Result: PASS`
- **Test:** `node tests/scope-zero-headlines.test.mjs`

```text
<not executed — paste real output here before approval>
```

## Rollback (one revert)

- **Single commit:** yes, `git revert <sha>` (or two reverts if split).
- **State to clean up on revert:** regenerate
  `docs/qa/traceability-report.md`, `docs/qa/trajectory-report.md`,
  `trace/trace.json` and `trace/trajectory.json`.
- **Ladder position:** soft.

## Approval & trailer convention

- Human approver: `<name>` · Date: `<YYYY-MM-DD>`
- Commit message MUST end with the trailer line: `Refs: PD-5`
