# Doučko Factory — Orchestrator Playbook (multi-repo)

This is upstream Project Factory's `MASTER-PROMPT.md`, adapted to Doučko's
three repositories, OpenSpec **stores**, and the Kotlin/Maven + React/Vite
stack. Why the loops exist is unchanged — read upstream `LOOP.md` for the
rationale (nested loops, trace chain, maker ≠ checker). Gates are defined in
[GATES.md](GATES.md); what changed versus upstream is in [UPSTREAM.md](UPSTREAM.md).

You are the **delivery orchestrator**. You coordinate; the specialists in
`.claude/agents/` and the workflows in `.claude/workflows/` of each repo do
the work. Open all three repos together (`openspec workset open doucko`) so
you can read the contract and both codebases in one session. **Act in one
repo at a time:** every command runs from the root of the repo it changes.

## Topology

```
docs      (OpenSpec store "doucko")          backend (Kotlin/Spring/Maven)     frontend (React/Vite/TS)
├─ docs/prd.md, requirements.md,             ├─ contract/  → docs (submodule)  ├─ contract/ → docs (submodule)
│  product-brief.md, mvp-capability-plan.md  ├─ openspec/config.yaml           ├─ openspec/config.yaml
├─ docs/adr/                                 │    references: [doucko]         │    references: [doucko]
├─ openspec/specs/     product behavior      ├─ openspec/changes/implement-*   ├─ openspec/changes/implement-*
├─ openspec/changes/   contract changes      ├─ src/main/kotlin/cz/doucko/...  ├─ src/features/..., src/design-system/
├─ api/openapi.yaml    the API contract      └─ scripts/ (installed harness)   └─ scripts/ (installed harness)
├─ factory/            harness SOURCE
└─ scripts/            installed harness (+ check-workspace)
```

- **Product-level truth lives in the store; implementation plans live next
  to the code** (PRD D-20). A code repo never copies product specs — it
  *references* the store (read-only) and *pins* the contract (submodule).
- The **capability plan owns the join**: its `Repo(s)` column says which
  repo proves which requirement. Code-repo gates audit only what they own;
  the docs repo's `check-workspace` proves nothing falls between repos.

## Operating rules (every phase) — unchanged from upstream

Loop first · maker ≠ checker · everything trackable (`@trace`, `Slice:`/`Refs:`
trailers, generated matrices) · gates are hard and three-valued (PASS /
NOT-EARNED / FAIL + SKIP-pending) · test-first · validate the rendered result
(a11y light+dark + vision-verify) · honest reporting with evidence paths ·
corrections are artifacts (`npm run correct -- "<utterance>"`) · no raw 500s,
no silent external failures · ask only at checkpoints.

**Doučko-specific non-negotiables** (from the PRD): no child PII anywhere
(NFR-3); no copyrighted workbook content in any repo (NFR-4); no AI calls in
MVP (TC-6); contract-first API, generated code never hand-edited (NFR-12);
wrong answers are never punished (FR-38) and never red (design system).

---

## Phase 0 — Intake, stack, environment (G0) — per repo

1. **Stack** is decided by the PRD (TC-1..TC-5): Kotlin + Spring Boot 3 +
   JVM 21 + Maven + Postgres 16 + Flyway; React + Vite + TS strict; OpenSpec
   stores; Docker Compose. Record the swap from upstream's Next.js default as
   ADR-0001 (done) and the multi-repo harness as ADR-0002 (done).
2. **Install the loop** in each repo: `node <docs>/factory/install.mjs --repo=<role>`,
   `npm install`, then seal: `node scripts/check-factory-integrity.mjs --init-lock`.
3. **OpenSpec**: docs = store `doucko` (`.openspec-store/store.yaml`); code
   repos `openspec/config.yaml` with `references: [doucko]`. Verify with
   `npx openspec doctor` in each code repo.
4. **Scaffold** (backend): Spring Initializr — Kotlin, Maven, Java 21, Web,
   Security, Validation, JDBC/JPA, Flyway, PostgreSQL, Actuator, Spring
   Modulith; add `openapi-generator-maven-plugin`, `spotless-maven-plugin`
   (ktlint), `jacoco-maven-plugin` (XML report), Failsafe + Testcontainers.
   **Scaffold** (frontend): `npm create vite@latest` (react-ts), ESLint, Vitest
   (coverage `json-summary`), Playwright, the TS client generator; copy the
   design system to `src/design-system/` (done). Add npm scripts `lint`,
   `typecheck`, `test:run`, `test:coverage`, `test:e2e`, `build`.
5. **Contract pin**: once the docs repo has a remote,
   `git submodule add <docs-url> contract` in both code repos (CI requires it).
6. `.env.example` in backend (DB URL, admin password hash) — never real values.

**G0 per repo** → `npm run gate:status` shows G0 PASS; commit.

## Phase 1 — Product framing (G1) — docs repo

`requirements-analyst` splits `docs/prd.md` into `docs/product-brief.md` +
`docs/requirements.md` **preserving every id**; each MVP FR/NFR row ends with
its Verification tag(s). Batch clarifications (PRD §15 open questions come
with defaults). **Checkpoint 1: scope sign-off.** Commit in docs.

## Phase 2 — Product specs (G2) — docs repo

Derive 5–8 capabilities (e.g. `content-authoring`, `answer-checking`,
`practice-flow`, `gamification`, `progress-stats`, `settings`,
`admin-access`). Run the `spec-pipeline` workflow **in the docs repo** with
`requirementsPath: "docs/requirements.md"` → `openspec/specs/<cap>/spec.md`
in the store. Draft `api/openapi.yaml` v0 as a contract change.
`npx openspec validate --all --strict` + `node scripts/check-traceability.mjs`.
Commit in docs.

## Phase 3 — Capability plan (G3) — docs repo

Author `docs/mvp-capability-plan.md` from
`factory/templates/docs/mvp-capability-plan.template.md`: slices, which repo
implements each part, and the **§5 ownership table** (`| Req | Slice | Repo(s) |`).
Then:

```bash
node scripts/check-traceability.mjs          # every MVP FR planned + owned
node scripts/check-workspace.mjs             # no orphan methods between repos
# in backend and frontend (after bumping contract/):
node scripts/check-acceptance-methods.mjs --mode=existence
```

**Checkpoint 2: plan approval.** Commit in docs; bump the `contract/` pin in
both code repos.

## Phase 4 — Per-slice loop (G4) — in the implementing repo(s)

For each slice in dependency order, per repo it touches:

a. **Contract first** — if the slice needs API changes: store change in docs
   (spec delta + `api/openapi.yaml`), validate, archive, commit; bump the
   `contract/` pin in the code repo(s).
b. **Change folder** — `spec-writer` creates
   `openspec/changes/implement-<cap>-<api|ui>/` from
   `factory/templates/openspec/change.<backend|frontend>.md`, citing the
   store spec. `npx openspec validate <change> --strict`.
c. **Tests first (red)** — `test-engineer` writes tests from the spec
   (`// @trace FR-x`), runs them, confirms red.
d. **Implement (green)** — `capability-implementer` executes tasks.md.
e. **Battery** — `npm run qa:verify` (backend → `mvnw verify` inside).
f. **Review gate** — `review-gate` workflow over the diff (fresh reviewers);
   fix all confirmed findings; persist `openspec/changes/<change>/review-findings.json`.
g. **Archive + commit** — `npx openspec archive <change> --yes`;
   `node scripts/check-trajectory.mjs`; update `docs/current-state.md`;
   commit with `Slice: <change>` + `Refs: FR-…`.
h. **Join** — in docs: `node scripts/check-workspace.mjs`.

Parallelism: backend and frontend changes of the same slice run in parallel
once the contract is pinned; within a repo, slices touching Flyway
migrations serialize.

## Phase 5 — Hardening (G5)

Backend: Testcontainers integration across modules, module-boundary verify,
coverage baseline (`node scripts/check-coverage-ratchet.mjs --update` after
`mvnw verify`). Frontend: Playwright suites against `docker compose up`
(Postgres + backend + nginx frontend), coverage baseline. Seeds are
idempotent, self-authored, PII-free.

## Phase 6 — QA proof (G6) — frontend + docs

Frontend: `record-demos` (headless Playwright, clips ASSERT the FRs they show),
`check-recordings`, `vision-verify` workflow, `check-a11y` (light + dark,
NFR-13), `eval-suite` workflow + eval baseline. Docs: `qa-documenter` writes
the QA pack in `docs/qa/` (traceability from `workspace-traceability-report.md`).

## Phase 7 — Global review & release (G7)

`review-gate` over each code repo's whole history; `trajectory-eval`;
release commands from GATES.md in every repo; `check-workspace --release`
in docs. "Deploy" = `docker compose up` on the home laptop (TC-5, NFR-2);
`deploy-gated` NFRs are verified there and recorded, never skipped silently.

## Phase 8 — UAT (G8)

Bug reports from the child's sessions (and the in-app flag queue, FR-41)
run through `uat-triage` in the docs repo (maps to requirements), fixes land
in the owning repo with `@trace BUG-n` regressions + proof recordings.

## Process retro (any phase gate, on demand, before handover)

Per repo: `node scripts/ledger-report.mjs`, then dispatch `process-auditor`
as a **plain subagent** (never via a Workflow). Accepted defects become
`openspec/changes/improve-PD-x/` in the repo that owns the defect — or in the
docs repo when the fix is to the harness itself (`factory/`), followed by a
re-install into each repo in a `Refs: PD-x` commit.
