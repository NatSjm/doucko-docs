# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-10-08 (Europe/Prague)
- **Current phase:** Phase 7
- **Last completed gate:** G3
- **Phase 6 (docs part) written, 2026-10-08:** the QA pack is in `docs/qa/`:
  `requirements-traceability-matrix.md`, `mvp-acceptance-report.md`,
  `risk-register.md`, `manual-test-plan.md` (not yet executed) and `demo-script.md`.
  - Pins: backend `26648ee`, frontend `a8aeb06`.
  - `check-workspace`: PASS, 64 MVP requirements, 2 contract-pin warnings
    (`docs/qa/workspace-traceability-report.md`).
  - All 64 rows read PASS deterministically (`docs/qa/requirements-traceability-matrix.md`).
- **G6 is not earned yet:**
  - Frontend G6 is SKIP-planned: no MVP requirement uses `eval` (only Future FR-45..49 and FR-51 do).
  - G1 and G3 need owner sign-off in every repo's `gate:status`. Docs G4, G6 and G7 are SKIP-pending.
  - The frontend summary is FAIL because COR-1 (the slice-1 waiver correction) has no disposition. Owner action.
  - The 11 `phase6-admin-theme` clips have no current vision verdict; vision-verify needs a re-run.
  - The CI `e2e-stack` job has never run, because nothing has been pushed since 2026-10-04.
  - No MVP row is `deploy-gated`. NFR-2, NFR-5, NFR-6 and NFR-10 are proved locally only.
  - Details and the Scope NOT delivered section: `docs/qa/mvp-acceptance-report.md`.
- **Next task:** the owner's items in `docs/qa/mvp-acceptance-report.md` §6 (G1/G3 sign-off, COR-1,
  vision re-run, push + CI), then Phase 7 (G7).
- **Earlier (Phase 3 close, kept for reference):**
- **Active change:** none in the store (`improve-PD-2..5` remain open retro items). Docs work is on `main` (`phase2-specs` fast-forwarded into it).
- **Phase 3 closed (G3), 2026-10-03:**
  - Plan approved at checkpoint 2 as drafted, with every §7 recommendation
    accepted — evidence: `docs/qa/checkpoint-2-plan-signoff.md`,
    `docs/mvp-capability-plan.md`. CA-D22 accepted (`docs/requirements.md` §6.7).
  - PD-9 fixed: the frontend has a real vision-verify mechanism
    (`scripts/check-vision.mjs`, npm `check:vision`) — evidence:
    `docs/qa/evidence/pd-9-vision-mechanism-proof.md`.
  - Contract pinned (D-P2): `contract/` submodule (`url = ../docs`) in backend
    and frontend at docs `4c87d67` (API 0.5.1). Local submodule commands need
    `-c protocol.file.allow=always`.
  - The first backend generator run on the pinned contract caught 3 YAML
    flow-mapping descriptions split into stray keys. Fixed in API 0.5.1
    (`openspec/changes/archive/2026-10-03-fix-contract-flow-descriptions/`).
    Backend `mvnw compile` (generated interfaces) and frontend `typecheck`
    pass on 0.5.1.
  - G3 checks, all on the pinned contract:
    `node scripts/check-traceability.mjs` PASS;
    `node scripts/check-workspace.mjs` PASS, 0 failures, 77 test-trace
    warnings expected before G4 — evidence: `docs/qa/workspace-traceability-report.md`;
    `check-acceptance-methods --mode=existence` PASS in backend and frontend.
  - In the code repos, `gate-status` shows G4–G8 FAIL / NOT-EARNED. That is
    expected: product scaffold exists and no slice evidence does yet.
  - Pins lag docs HEAD only by docs-only commits (this file, generated
    reports). Bump them when the contract or plan changes.
- **Next task (at the time):** Phase 4, slice 1 `platform-foundation` (plan §4.1).
  `implement-platform-foundation-api` (backend) and
  `implement-platform-foundation-ui` (frontend), following PLAYBOOK
  Phase 4 a–h.
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS; G1 signed off — evidence: `node scripts/gate-status.mjs` + `docs/qa/checkpoint-1-scope-signoff.md`
  - G2 PASS — evidence: `docs/qa/traceability-report.md` + `openspec/changes/archive/2026-10-03-add-api-contract-v0/`
  - G3 PASS — evidence: `docs/qa/checkpoint-2-plan-signoff.md` + `docs/qa/workspace-traceability-report.md`

> This header is machine-read: keep the exact formats `Phase <N>` and `G<N>`.

## Earlier phases

- **Phase 2 closed (G2):** `npx openspec validate --all --strict` and
  `node scripts/check-traceability.mjs` PASS. Contract change archived as
  `openspec/changes/archive/2026-10-03-add-api-contract-v0/` at
  `api/openapi.yaml` v0.5.0 (0.5.1 after the Phase 3 fix). Its `review-findings.json` is recorded as
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

## Source Of Truth

1. `AGENTS.md` — agent rules for this repo.
2. `docs/prd.md` → (Phase 1) `docs/requirements.md` + `docs/product-brief.md`.
3. `docs/mvp-capability-plan.md` (Phase 3) — slices + Repo(s) ownership.
4. `openspec/specs/` — product behavior (Phase 2).
5. `api/openapi.yaml` — API contract (Phase 2).
6. `docs/adr/` — decisions.
7. `factory/` — the harness (PLAYBOOK, GATES, README, UPSTREAM).

## Open items

- Remotes: `origin` exists on GitHub for all three repos, but nothing has been pushed since 2026-10-04 (see `docs/qa/mvp-acceptance-report.md` §5). Add `remote:` to
  `.openspec-store/store.yaml`. The `contract/` pins already use the relative
  URL `../docs`, so they resolve if the three remotes sit side by side
  (same host and owner, repos named `docs`, `backend`, `frontend`).
- Contract review: API 0.5.x has no clean independent review
  (`openspec/changes/archive/2026-10-03-add-api-contract-v0/review-findings.json`).
  Re-run `contract-review` before G7.
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
