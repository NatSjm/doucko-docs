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
  `docs/qa/checkpoint-1-scope-signoff.md`). Phase 2 in progress:
  - Baseline specs for 7 capabilities under `openspec/specs/`
    (content-authoring, answer-checking, practice-flow, gamification,
    progress-stats, child-profile, admin-access). All 48 MVP FRs are cited,
    each by exactly one spec — evidence: `node scripts/check-traceability.mjs`
    (Result: PASS) and `npx openspec validate --all --strict`.
  - `api/openapi.yaml` v0.1.0 drafted in change `add-api-contract-v0`
    (31 paths, 45 operations); structural check only, no linter/generator run yet.
  - Specs were authored inline, not through the `spec-pipeline` workflow:
    the independent critique + cross-check (maker ≠ checker) has NOT run.
  - PD-8 / COR-2 (G2 vacuous PASS) fixed in all three repos (docs edc3f19,
    backend c58094f, frontend b0a848b); COR-2 awaits the product owner's
    disposition — until then gate-status is red by design.
- **Next task:** run the independent spec critique and cross-check; review
  and archive `add-api-contract-v0`; merge `phase2-specs` → `main`. Then
  Phase 3 (capability plan, checkpoint 2).
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS; G1 signed off — evidence: `node scripts/gate-status.mjs` + `docs/qa/checkpoint-1-scope-signoff.md`
  - G2 not yet claimed: specs exist and trace, but the critique pass and contract archive are pending

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
