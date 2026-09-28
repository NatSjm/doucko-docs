# Doučko — docs repo (OpenSpec store `doucko`) — Agent Rules

This repo is the **product contract** of a three-repo delivery. It holds the
requirements, the capability plan, product-level OpenSpec specs, ADRs, the
API contract, and the source of the delivery harness (`factory/`). It holds
**no application code**. Sibling repos: `../backend` (Kotlin + Spring Boot +
Maven) and `../frontend` (React + Vite + TS); both pin this repo as their
`contract/` submodule and `references: [doucko]` it in OpenSpec.

Use `docs/requirements.md` to understand the requirements (until Phase 1
produces it, `docs/prd.md` is the source).

## Delivery harness (adapted Project Factory)

- Playbook: `factory/PLAYBOOK.md` · Gates: `factory/GATES.md` ·
  How it works / setup: `factory/README.md` · Provenance: `factory/UPSTREAM.md`.
- `factory/` is the **source**; `scripts/`, `.githooks/`, `.claude/agents/`,
  `.claude/workflows/` are **installed copies** (`npm run factory:install`).
  Edit the source, re-install, never hand-edit an installed copy —
  `npm run factory:check` fails on drift.
- Gates are commands: `npm run qa:verify` (battery), `npm run gate:status`
  (G0–G8), `npm run check:workspace` (cross-repo join over ../backend and
  ../frontend).

## What lives here (and what does not)

| Here (store) | In backend / frontend |
|---|---|
| `docs/prd.md`, `docs/product-brief.md`, `docs/requirements.md` | — |
| `docs/mvp-capability-plan.md` incl. the **Repo(s) ownership table** | read via `contract/` |
| `openspec/specs/<capability>/spec.md` — product behavior | `openspec/changes/implement-*` — implementation plans |
| `openspec/changes/<id>/` — cross-repo contract changes | — |
| `api/openapi.yaml` — the API contract (NFR-12) | generated code only, never hand-edited |
| `docs/adr/` — architecture decisions | repo-local implementation ADRs |

## Project Handoff Protocol

Before any substantive change read, in order: `docs/current-state.md`,
`docs/mvp-capability-plan.md` (once it exists), `openspec/specs/`, `docs/adr/`.
Update `docs/current-state.md` at every milestone (Europe/Prague time; keep
the machine-read `Current phase: Phase <N>` / `Last completed gate: G<N>`
lines exact). It is a handoff aid, not the source of truth.

## Rules

- **Requirement ids are permanent.** Never renumber FR/NFR/TC/BC; amend by
  appending. Every MVP FR/NFR row ends with its Verification tag(s) from the
  closed vocabulary `local-verifiable | vision-verify | recording | e2e |
  a11y | eval | deploy-gated`.
- **Every MVP requirement has an owner repo** in the plan's `| Req | Slice |
  Repo(s) |` table; every declared method must be provable by an owner repo
  (`check-workspace` fails on orphans).
- **Contract changes flow outward:** change a spec or `api/openapi.yaml`
  here (OpenSpec change → validate → archive → commit), then bump the
  `contract/` pin in each code repo that must follow.
- **Never commit** workbook content — text, images, answer keys, PDFs
  (NFR-4) — or anything identifying the child (NFR-3). The pre-commit hook
  refuses PDFs and runtime-data paths.
- `npx openspec validate --all --strict` must pass before every commit that
  touches `openspec/`.
- Process honesty: absence of evidence is NOT-EARNED, never PASS; every
  done-claim carries an evidence path; record human contradictions with
  `npm run correct -- "<utterance>"`.

<!-- BEGIN-FACTORY-LESSONS -->
<!--
  Managed region: `node factory/install.mjs` upserts cross-project lesson
  blocks here (BEGIN-LESSON-<id> / END-LESSON-<id>). Manual edits inside a
  lesson block are preserved. Do not remove these outer markers.
-->
<!-- BEGIN-LESSON-vacuous-pass-not-earned -->
### Lesson: a PASS over zero evidence is NOT-EARNED (vacuous-pass-not-earned, v1)

- Never report a gate or check as PASS when its evidence scope is 0 ("Scope: 0
  clip(s)", empty archive, no eval results) while product code exists (Doučko:
  `factory.config.json` productCode — backend `src/main/`, frontend `src/`
  minus `src/design-system/`). Render it **NOT-EARNED**
  and exit non-zero.
- Before product code exists, an empty scope is **SKIP-pending**: print it
  explicitly; it is visible and never counted as PASS.
- Never fold SKIP / 0-scope results into an overall "Pass" summary
  (`qa-verify`, `gate-status`). Field evidence: `worst()` folded SKIP into
  PASS and G4–G8 rendered green over literally nothing
  (2026-07-02-pixel-perfect-forensics.md, RC2).
<!-- END-LESSON-vacuous-pass-not-earned -->
<!-- BEGIN-LESSON-declared-method-needs-mechanism -->
### Lesson: a declared acceptance method needs an executable mechanism (declared-method-needs-mechanism, v1)

- Every FR/NFR that declares a verification method (pixel-diff, e2e,
  recording, a11y, eval, ...) must resolve to a real, executable, non-stub
  mechanism BEFORE the build phase starts: an installed check script, or a
  package.json script whose body does not match
  `/^echo |^true$|not yet configured/i`.
- A spec file that restates the requirement is NOT a mechanism. Field
  evidence: NFR-19 encoded "≥ 99% pixel match" while no pixel-diff tool
  existed anywhere and `test:e2e` was an echo stub exiting 0
  (2026-07-02-pixel-perfect-forensics.md, RC1).
- If a declared method has no mechanism, do not proceed: implement the check,
  or record an explicit human waiver — never let the declaration float
  unverifiable into the build.
<!-- END-LESSON-declared-method-needs-mechanism -->
<!-- BEGIN-LESSON-done-claims-need-evidence -->
### Lesson: done-claims need evidence pointers (done-claims-need-evidence, v1)

- Never write strong completion language ("Convergence reached", "all gates
  pass", "verification-only", "Overall result: Pass", "ready for release /
  sign-off", "done", "complete") into current-state.md, PR bodies, or handoff
  docs unless the same line carries a resolvable evidence pointer — a path
  that exists on disk (e.g. `docs/qa/automated-verification-latest.md`) and
  is fresh — or an explicit "Scope NOT delivered" section.
- The verdict belongs to exit-coded checks, not narrative. Field evidence:
  "Convergence reached … verification-only" was written while the same file
  admitted the formal acceptance was never run
  (2026-07-02-pixel-perfect-forensics.md, RC6).
- When you catch an unbacked claim, treat it as a correction event: file it,
  do not silently rewrite it.
<!-- END-LESSON-done-claims-need-evidence -->
<!-- END-FACTORY-LESSONS -->
