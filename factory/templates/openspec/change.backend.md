# OpenSpec implementation change — BACKEND skeleton

> `openspec new change implement-<capability>-api` in the backend repo. Split
> into `proposal.md`, `design.md`, `tasks.md`; the spec delta goes to
> `specs/<capability>/spec.md` as `## ADDED Requirements` (backend-level
> scenarios only). Cite the store spec: `openspec show <cap> --type spec --store doucko`.

## proposal.md

```markdown
# Implement <Capability> (backend)

## Why
{{2-4 sentences. Store spec: `<capability>` (docs store). FR refs owned by backend.}}

## What Changes
- {{endpoints implemented (operationIds from contract/api/openapi.yaml), modules, migrations}}

## Impact
- Store spec: {{…}} · Contract pin: {{docs commit}}
- Modules: {{cz.doucko.<module>}} · Flyway: {{V<n>__…}}
- Dependencies: {{prior slices, new Maven deps}}
```

## design.md

```markdown
# Design — implement-<capability>-api

## Goals / Non-goals
## Key decisions (with trade-offs; flag ADR-worthy)
## Module + hexagon placement (domain / application / adapter-in / adapter-out)
## Data model (tables, JSONB payload types, indexes, FKs, migration)
## Error handling (problem+json per error; UNPARSEABLE vs WRONG; no raw 500s)
## Risks & mitigations
```

## tasks.md

```markdown
## 1. Contract and schema
- [ ] 1.1 Confirm the `contract/` pin includes the operations this change implements.
- [ ] 1.2 Flyway migration `V<n>__<capability>.sql` (+ indexes/constraints).

## 2. Failing tests first (red) — from the spec, before implementation
- [ ] 2.1 Unit (`*Test.kt`): domain rules incl. locale inputs (decimal comma,
        NBSP/thin-space thousands, trailing zeros, blank, oversized). `// @trace FR-x`.
- [ ] 2.2 Integration (`*IT.kt`, Testcontainers Postgres): persisted outcomes
        of the use case; admin auth negative cases where relevant.
- [ ] 2.3 Run `node scripts/mvnw.mjs -B verify` — confirm RED on assertions, not compile errors.

## 3. Domain + application (green)
- [ ] 3.1 `domain/` pure Kotlin (no Spring) — make 2.1 pass.
- [ ] 3.2 `application/` use cases + ports.

## 4. Adapters (green)
- [ ] 4.1 `adapter/out/persistence` — make 2.2 pass.
- [ ] 4.2 `adapter/in/web` implements the generated `*Api` interface; errors → problem+json.

## 5. Validation, review, archive
- [ ] 5.1 `npm run qa:verify` (mvnw verify, coverage ratchet, traceability, acceptance join) — green.
- [ ] 5.2 `npx openspec validate implement-<capability>-api --strict`
- [ ] 5.3 review-gate workflow (fresh reviewers); fix all confirmed findings; persist `review-findings.json` (clean:true); re-run 5.1.
- [ ] 5.4 Smoke: {{spell out: docker compose up db; start app; curl the endpoints; expected responses}}.
- [ ] 5.5 Update `docs/current-state.md`.
- [ ] 5.6 Archive only after 5.1–5.5: `npx openspec archive implement-<capability>-api --yes`; commit with `Slice: implement-<capability>-api` + `Refs: FR-…`.
```
