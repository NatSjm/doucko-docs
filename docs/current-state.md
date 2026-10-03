# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-10-03 (Europe/Prague)
- **Current phase:** Phase 3
- **Last completed gate:** G2
- **Active change:** none in the store (`improve-PD-2..5` remain open retro items). Branch `phase2-specs` holds Phase 2 and the Phase 3 plan draft; not yet merged to `main`.
- **Phase 3 (2026-10-03, awaiting checkpoint 2):**
  - `docs/mvp-capability-plan.md` drafted: 9 slices, every MVP FR and NFR owned
    (§5), and owners and mechanisms for the deferred cross-cutting NFRs (§2.1).
    Decisions D-P1..D-P4 (§7) are open for the product owner.
  - G3 checks: `node scripts/check-traceability.mjs` PASS;
    `node scripts/check-workspace.mjs` PASS (64 requirements; the 77
    test-trace warnings are expected before G4, and the 2 contract-pin
    warnings are D-P2) — evidence: `docs/qa/workspace-traceability-report.md`.
    `check-acceptance-methods --mode=existence`: backend PASS, **frontend
    FAIL**: FR-36 and FR-37 declare `vision-verify`, but there is no
    `check:vision` mechanism (candidate: `../frontend/trace/missing-gate-candidates/vision-verify.md`).
    It must be fixed or waived before Phase 4.
  - CA-D22 (narrows FR-56) is pending at checkpoint 2: `docs/requirements.md` §6.7.
- **Phase 2 closed (G2):** `npx openspec validate --all --strict` and
  `node scripts/check-traceability.mjs` PASS. Contract change archived as
  `openspec/changes/archive/2026-10-03-add-api-contract-v0/` at
  `api/openapi.yaml` v0.5.0. Its `review-findings.json` is recorded as
  **not clean**: v0.1–v0.4 were reviewed and every finding was applied
  (57 → 31 → 20 → 18), but v0.5 has no clean review yet. Re-run
  contract-review before G7. Spec cross-check rounds 3–5:
  `trace/workflow-runs/20261003-060054-spec-crosscheck.json`, `…150844…`, `…151524…`.
- **Phase 2 history:** Phase 1 signed off on 2026-10-02 (evidence:
  `docs/qa/checkpoint-1-scope-signoff.md`). Phase 2 on `phase2-specs`:
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
- **Next task:** checkpoint 2 (plan approval and D-P1..D-P4, CA-D22). Then
  fix or waive the frontend vision-verify mechanism, record the sign-off,
  merge `phase2-specs` → `main`, pin `contract/` in both code repos
  (D-P2), and re-run the existence check. Then Phase 4, slice 1
  (`platform-foundation`).
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS; G1 signed off — evidence: `node scripts/gate-status.mjs` + `docs/qa/checkpoint-1-scope-signoff.md`
  - G2 PASS — evidence: `docs/qa/traceability-report.md` + `openspec/changes/archive/2026-10-03-add-api-contract-v0/`
  - G3 not earned: frontend acceptance existence FAIL (vision-verify) and checkpoint 2 pending

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
