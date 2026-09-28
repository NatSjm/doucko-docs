# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-09-28 (Europe/Prague)
- **Current phase:** Phase 0
- **Last completed gate:** none
- **Active change:** none
- **Progress:** The delivery harness (adapted Project Factory) is installed:
  source in `factory/`, installed copies in `scripts/`, `.githooks/`,
  `.claude/`. This repo is registered as OpenSpec store `doucko` (CLI pinned
  1.13.2). The PRD is in `docs/prd.md`; ADR-0001 (stack) and ADR-0002
  (multi-repo store + harness) are accepted. Backend and frontend repos exist
  with the harness installed but no application scaffold yet.
- **Next task:** Phase 0 step 4 — scaffold the Spring Boot backend and the
  Vite frontend (factory/PLAYBOOK.md), then Phase 1 — run the
  `requirements-analyst` on `docs/prd.md` to produce `docs/product-brief.md`
  and `docs/requirements.md`.
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - Gate summary — evidence: `node scripts/gate-status.mjs` (G0 needs the integrity lock + scaffolds)

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
- PRD OQ-1..OQ-10 open questions carry recommended defaults — confirm at checkpoint 1.

## Validation

```bash
npm run qa:verify
npm run gate:status
npm run check:workspace
npx openspec validate --all --strict
```
