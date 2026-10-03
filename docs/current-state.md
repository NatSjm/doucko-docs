# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-10-03 (Europe/Prague)
- **Current phase:** Phase 2
- **Last completed gate:** G1
- **Active change:** `add-api-contract-v0` (draft, not archived) — Phase 2 work on branch `phase2-specs`
- **Progress:** Phase 1 signed off on 2026-10-02 (evidence:
  `docs/qa/checkpoint-1-scope-signoff.md`). Phase 2 in progress on `phase2-specs`:
  - Workflows run through `scripts/run-workflow.mjs` (factory/README.md,
    "Running workflows"); the Claude CLI must be signed in.
  - Specs re-authored by the `spec-pipeline` workflow (product owner's
    choice): 22 steps, $13.06 — evidence: `trace/workflow-runs/20261003-043657-spec-pipeline.json`.
  - Its cross-check findings were fixed; the independent `spec-crosscheck`
    run confirmed 18 of 26 resolved and all 48 MVP FRs owned exactly once —
    evidence: `trace/workflow-runs/20261003-052439-spec-crosscheck.json`.
    The 8 open items are the deferred cross-cutting NFRs (NFR-3, 4, 6, 9-13
    scopes), to be owned in the Phase 3 plan. Its 4 new minor findings were
    fixed afterwards and are not yet independently re-checked.
  - Spec-derived rulings accepted 2026-10-03: `docs/requirements.md` §6.5-6.6.
  - Specs validate (`npx openspec validate --all --strict`) and trace
    (`node scripts/check-traceability.mjs`, Result: PASS).
  - Round-2 cross-check confirmed the 4 follow-up fixes resolved; its 4 new
    minor items were fixed (evidence: `trace/workflow-runs/20261003-053109-spec-crosscheck.json`).
  - `api/openapi.yaml` v0.2.0 in change `add-api-contract-v0` (draft): the
    independent contract review of v0.1 found 57 mismatches (4 blocker), all
    applied — evidence: `trace/workflow-runs/20261003-053111-contract-review.json`.
    v0.2 itself is not yet re-reviewed.
- **Next task:** optional verification re-runs (contract-review on v0.2,
  spec-crosscheck); archive `add-api-contract-v0`; merge `phase2-specs` →
  `main`. Then Phase 3 (capability plan incl. owners for the deferred NFRs,
  and NFR-9's admin half; checkpoint 2).
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS; G1 signed off — evidence: `node scripts/gate-status.mjs` + `docs/qa/checkpoint-1-scope-signoff.md`
  - G2 not yet claimed: contract change not archived

> This header is machine-read: keep the exact formats `Phase <N>` and `G<N>`.

## Source Of Truth

1. `AGENTS.md` — agent rules for this repo.
2. `docs/prd.md` → (Phase 1) `docs/requirements.md` + `docs/product-brief.md`.
3. `docs/mvp-capability-plan.md` (Phase 3) — slices + Repo(s) ownership.
4. `openspec/specs/` — product behavior (Phase 2).
5. `api/openapi.yaml` — API contract (Phase 2).
6. `docs/adr/` — decisions.
7. `factory/` — the harness (PLAYBOOK, GATES, README, UPSTREAM).

## Open items

- Remotes: none yet. When created, add `remote:` to
  `.openspec-store/store.yaml` and pin `contract/` in both code repos.
- PRD §11.1: the docs repo was meant to be a fork of the course capstone
  repo; here it is a standalone store. If it must become that fork, the
  store can live at the fork root (see factory/README.md).

## Validation

```bash
npm run qa:verify
npm run gate:status
npm run check:workspace
npx openspec validate --all --strict
```
