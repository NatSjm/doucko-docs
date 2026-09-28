# Improvement Proposal: improve-PD-4

- **Defect:** PD-4 (`docs/qa/process-defects.json`). qa-verify renders `openspec-all` as PASS over "No items found to validate." and renders `openspec-active-list` (a listing, not a check) as PASS. The openspec rows carry no `Scope:` line, so the zero-scope classifier and the vacuous-pass counter cannot see that they covered nothing.
- **Class / severity:** check-too-weak / P1
- **Status:** draft

## Scope

**Changes:** how qa-verify classifies the two openspec members.

**Does NOT change:**
- the openspec CLI
- the command lines
- the classification of any other member

## Target file

`factory/scripts/qa-verify.mjs`. This is **presumed**: it is the source of
the installed `scripts/qa-verify.mjs` named in
`docs/qa/automated-verification-latest.md:3`. The auditor did not open it,
because it is outside the read set.

## Exact diff

**NOT DRAFTED.** The target file is outside the auditor's read set.
Required behaviour:

1. `openspec-all`: derive a scope from the output. `No items found to
   validate.` means Scope: 0, which goes through the same zero-scope rule as
   the other members: SKIP-pending pre-product, NOT-EARNED post-product.
   Otherwise the scope is the count of validated items.
2. `openspec-active-list`: render as `INFO`. It is excluded from the overall
   fold and never counted as PASS.
3. Both rows print `Scope: N` like every other member (compare line 94:
   `Status: PASS (exit code: 0, Scope: 20)`).

## Expected metric movement

- **Metric:** zero-scope members rendered PASS. This feeds `vacuousPasses`
  once product code exists.
- **Current:** 2 (`openspec-all`, `openspec-active-list`), and invisible to
  `vacuousPasses`.
- **Expected after fix:** 2 -> 0.
- **Verified by:** the NEXT retro reads the same metric. **No movement =
  auto-flag this improvement for revert.**

## EXECUTED red→green proof

**No executed proof exists.** Proof plan, to be executed and pasted here
before approval:

- **Red fixture:** `tests/fixtures/qa-verify-openspec/red/`, a repo with an
  empty `openspec/`. The current qa-verify renders `openspec-all` PASS, and
  the test must fail on that.
- **Green fixture:** the same tree gives SKIP-pending (Scope: 0). A tree with
  one valid spec gives PASS (Scope: 1). `openspec list` gives INFO in both.
- **Test:** `node tests/qa-verify-openspec.test.mjs`

```text
<not executed — paste real output here before approval>
```

## Rollback (one revert)

- **Single commit:** yes, `git revert <sha>`.
- **State to clean up on revert:** regenerate
  `docs/qa/automated-verification-latest.md`.
- **Ladder position:** soft.

## Approval & trailer convention

- Human approver: `<name>` · Date: `<YYYY-MM-DD>`
- Commit message MUST end with the trailer line: `Refs: PD-4`
