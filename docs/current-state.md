# Current State — docs (OpenSpec store `doucko`)

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> the gate scripts, and the repo.

## Last Updated

- **Date and time:** 2026-10-02 (Europe/Prague)
- **Current phase:** Phase 2
- **Last completed gate:** G1
- **Active change:** none
- **Progress:** Phase 1 signed off at checkpoint 1 on 2026-10-02 (evidence:
  `docs/qa/checkpoint-1-scope-signoff.md`). `docs/product-brief.md` and
  `docs/requirements.md` are the source of truth for scope; `docs/prd.md`
  stays as the vision/UX/architecture record. All 27 defaults (OQ-1..OQ-27)
  were accepted: appended FR-55..FR-58 and NFR-15..NFR-17, amended NFR-8
  (now `recording`) and NFR-10 (cross-platform `npm run backup`).
  48 MVP FRs (evidence: `node scripts/check-traceability.mjs`).
- **Next task:** Phase 2 — derive 5–8 capabilities, run the `spec-pipeline`
  workflow with `requirementsPath: "docs/requirements.md"` to write
  `openspec/specs/<cap>/spec.md`, and draft `api/openapi.yaml` v0 as a
  contract change (factory/PLAYBOOK.md). Specs must state the §6 decisions
  as scenarios on the FRs they refine.
- **Claims:**
  - Harness installed and not drifted — evidence: `node factory/install.mjs --repo=docs --check`
  - G0 PASS; G1 signed off — evidence: `node scripts/gate-status.mjs` + `docs/qa/checkpoint-1-scope-signoff.md`
  - Known harness issue: gate-status shows G2 PASS with 0 of 48 MVP FRs cited by a spec (no specs exist yet); this is NOT a G2 pass

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
