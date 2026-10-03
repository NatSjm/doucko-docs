# Checkpoint 2 — Capability plan approval (G3)

| | |
|---|---|
| **Date** | 2026-10-03 (Europe/Prague) |
| **Signed off by** | Product owner (parent), in the Claude Code chat |
| **Applies to** | `docs/mvp-capability-plan.md` (9 slices, §5 ownership, §2.1 deferred-NFR owners, §7 decisions) |
| **Branch / draft commit** | `phase2-specs`, plan drafted at `38527fb` |

## Answers, verbatim

| Question | Answer |
|---|---|
| Approve the capability plan? | First "Approve with changes". Asked which changes, after reading the plan: "they are ok continue". Recorded as **approved as drafted**. |
| CA-D22: reports and opened hints block deletion (narrows FR-56) | "Accept (Recommended)" |
| Frontend G3 failure: no `check:vision` mechanism for FR-36 and FR-37 | "Fix the harness (Recommended)", recorded as PD-9 |
| D-P1 (Compose in backend) and D-P2 (`contract/` as a relative `../docs` submodule) | "Accept both (Recommended)" |

## What the sign-off changed

| Decision | Effect |
|---|---|
| Plan approval | `docs/mvp-capability-plan.md` status changed from draft to approved; §7 lists the accepted decisions. |
| CA-D22 | `docs/requirements.md` §6.7 is now "Rulings accepted at checkpoint 2"; the FR-56 row points there; the content-authoring CA-D table and its delete rule are no longer pending. |
| PD-9 | A harness fix: the frontend gets a real `vision-verify` mechanism (`check:vision`) before Phase 4. |
| D-P1 | Slice 1 (`platform-foundation`) puts `compose.yaml` and `npm run backup` in the backend repo. |
| D-P2 | Both code repos pin `contract/` as a submodule with the relative URL `../docs`. |

No requirement id was renumbered or removed.

## Evidence

- `node scripts/check-traceability.mjs`: every MVP FR is planned and has an
  owner repo (`docs/qa/traceability-report.md`).
- `node scripts/check-workspace.mjs`: no orphan (requirement, method) pair
  between repos (`docs/qa/workspace-traceability-report.md`).
- `check-acceptance-methods --mode=existence` in backend and frontend: see
  `docs/current-state.md` for the result after PD-9 and the contract pin.

## Not covered by this sign-off

- No implementation exists. G4 and later are not started.
- The archived contract's `review-findings.json` is recorded as not clean:
  v0.5.0 has had no clean independent review. A contract-review re-run is
  due before G7.
