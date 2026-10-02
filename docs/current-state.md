# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-10-02 (Europe/Prague)
- **Current phase:** Phase 1
- **Last completed gate:** G0
- **Active change:** none (Phase 1 work is on branch `phase1-framing`)
- **Progress:** Phase 0 merged: `main` fast-forwarded to `phase0-scaffold`
  in all three repos (backend and frontend scaffolds, ADR-0003). Phase 1
  draft written: `docs/product-brief.md` and `docs/requirements.md` split
  from `docs/prd.md`, all 80 FR/NFR/TC/BC ids carried over unchanged; the
  NFR table gained a Phase column (NFR-14 → Future). 27 open questions with
  defaults are in `docs/requirements.md` §6 (OQ-1..OQ-10 from the PRD,
  OQ-11..OQ-27 new).
- **Next task:** Checkpoint 1 — the product owner answers §6 ("use defaults"
  or per item). Then append the accepted scope as new ids (FR-55+, NFR-15+),
  record the sign-off, commit, and merge `phase1-framing` → `main`.
  After that: Phase 2 (product specs).
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS, G1 needs sign-off — evidence: `node scripts/gate-status.mjs`
  - 44 MVP FRs parsed from requirements.md — evidence: `node scripts/check-traceability.mjs` ("Scope: 44 MVP FR(s)")
  - Known harness issue: gate-status shows G2 PASS with 0 of 44 MVP FRs cited by a spec (no specs exist yet); this is NOT a G2 pass

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
- Checkpoint 1: OQ-1..OQ-27 in `docs/requirements.md` §6 carry recommended defaults — awaiting the product owner's answers.

## Validation

```bash
npm run qa:verify
npm run gate:status
npm run check:workspace
npx openspec validate --all --strict
```
