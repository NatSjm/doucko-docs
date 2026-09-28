# OpenSpec implementation change — FRONTEND skeleton

> `openspec new change implement-<capability>-ui` in the frontend repo. Split
> into `proposal.md`, `design.md`, `tasks.md`; the spec delta goes to
> `specs/<capability>/spec.md` as `## ADDED Requirements` (UI-level scenarios
> only). Cite the store spec: `openspec show <cap> --type spec --store doucko`.

## proposal.md

```markdown
# Implement <Capability> (frontend)

## Why
{{2-4 sentences. Store spec: `<capability>`. FR refs owned by frontend.}}

## What Changes
- {{screens / states (design-system components used), API operations consumed}}

## Impact
- Store spec: {{…}} · Contract pin: {{docs commit}} · Generated client regenerated: {{yes/no}}
- Features: {{src/features/<domain>}}
```

## design.md

```markdown
# Design — implement-<capability>-ui

## Goals / Non-goals
## Screens and states (loading / empty / error / each feedback state)
## Design-system mapping (components + tokens; no raw values)
## Data flow (generated client + TanStack Query keys, invalidation)
## Copy (Czech child UI / English admin; externalized keys)
## Accessibility (keyboard path, focus, reduced motion, contrast)
## Risks & mitigations
```

## tasks.md

```markdown
## 1. Contract
- [ ] 1.1 Confirm the `contract/` pin; regenerate the API client (never hand-edit generated code).

## 2. Failing tests first (red)
- [ ] 2.1 Unit (Vitest): view-model logic, Czech number formatting, state transitions. `// @trace FR-x`.
- [ ] 2.2 E2E (Playwright `e2e/*.spec.ts`) for the slice's flows incl. keyboard-only path. `// @trace FR-x`.
- [ ] 2.3 Eval case(s) in `evals/cases/<domain>.eval.ts` for copy tone / error clarity (rubric + `@trace`).
- [ ] 2.4 Run them — confirm RED on assertions.

## 3. UI (green)
- [ ] 3.1 `src/features/<domain>/` screens from design-system components.
- [ ] 3.2 Inline error states; nothing punishing (FR-38); Enter submits (NFR-7).

## 4. Validation, review, archive
- [ ] 4.1 `npm run qa:verify` — green (lint, typecheck, unit, coverage ratchet, e2e, build, traceability, acceptance join).
- [ ] 4.2 `npx openspec validate implement-<capability>-ui --strict`
- [ ] 4.3 review-gate workflow (incl. visual lens); fix confirmed findings; persist `review-findings.json` (clean:true).
- [ ] 4.4 Smoke against the compose stack: {{spell out the click path}}.
- [ ] 4.5 Update `docs/current-state.md`.
- [ ] 4.6 Archive: `npx openspec archive implement-<capability>-ui --yes`; commit with `Slice: implement-<capability>-ui` + `Refs: FR-…`.
```
