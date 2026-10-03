# Proposal: add-api-contract-v0

- **Kind:** cross-repo contract change (docs store)
- **Affects:** `api/openapi.yaml` (new), backend (generated `kotlin-spring`
  interfaces), frontend (generated TS client). No product spec changes.
- **Status:** draft — review before archive; code repos pin it only after
  archive (AGENTS.md: contract changes flow outward).

## Why

NFR-12 makes the OpenAPI contract the single source of truth for both code
repos (TC-3, D-19). Phase 2 of the playbook drafts v0 next to the baseline
specs so Phase 3 can plan slices against real operations.

## What changes

`api/openapi.yaml` v0.1.0 (OpenAPI 3.0.3): 31 paths, 45 operations.

| Area | Operations | Spec |
|---|---|---|
| `/api/child/hq`, missions, summary | HQ, briefing, mission summary | practice-flow, gamification |
| `/api/child/missions/{id}/…` tasks | current task, task, attempts, hints, replay | practice-flow, answer-checking |
| `/api/child/tasks/{id}/reports`, images | report a problem, task images | practice-flow |
| `/api/child/profile/settings` | get/patch settings (`GUIDED` → 422) | child-profile |
| `/api/admin/session` | sign in/out, session probe | admin-access |
| `/api/admin/sources`, tasks, missions, reference | CRUD, uploads, publish rules, answer tester, preview | content-authoring |
| `/api/admin/stats`, reports | weekly stats, flag queue, re-evaluate, dismiss | progress-stats |

Conventions fixed by v0:

- Child area has no authentication; admin area uses the `SESSION` cookie
  plus `X-XSRF-TOKEN` on data-changing calls (401 / 403).
- Errors are `application/problem+json` with `errors[]` (field validation)
  and `conflicts[]` (ids that block a state change, e.g. FR-57).
- An unparseable submission returns `200` with `status: UNPARSEABLE`, not an
  error: no attempt is used (FR-22).
- Rule-violating state changes (publish, delete, re-submit) return `409`.

## Decisions to review

1. The rank ladder and names are served by the backend (`Rank` in HQ), so the
   skin's ladder lives in backend configuration; the frontend skin keeps
   copy, art and colours.
2. Answer specs use one flat `AnswerSpec` with type-specific optional fields
   rather than a `oneOf` per type, to keep both generators simple. The
   backend validates the per-type combinations.
3. Mission runs are implicit: `current-task` resumes the latest run and
   `replay` starts a new one; there is no run id in the API.

## Validation

- Structural check (YAML parses, every `$ref` resolves, unique operationIds,
  path parameters declared, admin ops secured, child ops open): pass.
- Not yet run: an OpenAPI linter and the two generators. Phase 4a runs the
  backend `openapi-generator-maven-plugin` and the frontend client generator
  against the pinned file.
