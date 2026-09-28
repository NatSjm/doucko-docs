# Current State — {{REPO}}

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo. Each of the three repos keeps its own copy; the docs
> repo's copy tracks the product-level phase.

## Last Updated

- **Date and time:** {{YYYY-MM-DD HH:MM:SS}} (Europe/Prague)
- **Current phase:** Phase {{N}}
- **Last completed gate:** G{{N}}
- **Active change:** {{openspec change name or "none"}}
- **Contract pin:** {{docs commit pinned in contract/ — code repos only}}
- **Progress:** {{2-6 sentences: what is done, validated, archived}}
- **Next task:** {{the exact next action a fresh session should take}}
- **Claims:**
  - {{each "done"/"verified" claim, one per line}} — evidence: {{path}}

> This header is machine-read: keep the exact formats `Phase <N>` and `G<N>`,
> and give every done/verified claim an evidence path — `gate-status`
> hard-fails on divergence between this header and computed gate status.

## Source Of Truth

1. `AGENTS.md` — this repo's agent rules.
2. `docs/current-state.md` — this handoff.
3. Contract (docs store; `contract/` in code repos): `docs/requirements.md`,
   `docs/mvp-capability-plan.md`, `openspec/specs/`, `api/openapi.yaml`, `docs/adr/`.
4. This repo's `openspec/changes/` — implementation changes in motion.
5. `docs/qa/` — generated reports and evidence.

## OpenSpec Status

```bash
npx openspec validate --all --strict   # expected: all pass
npx openspec list                      # expected: No active changes (between slices)
npx openspec doctor                    # expected: reference doucko ok (code repos)
```

## Completed Changes

### {{n}}. `<change-id>`

Status: {{planned / in progress / implemented / validated / archived}}.
Smoke test: {{what was exercised}}.
Latest checks: {{battery results, report path}}.

## Validation

```bash
npm run qa:verify      # the repo battery (backend: runs mvnw verify)
npm run gate:status    # G0–G8 three-valued summary
```

## Agent Rules / Gotchas

- {{framework-version gotchas discovered during the build}}
- Windows dev machine: use `node scripts/mvnw.mjs` (picks mvnw.cmd / ./mvnw).
- Do not archive OpenSpec changes before implementation and smoke test.
