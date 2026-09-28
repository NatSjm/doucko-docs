# ADR-0002: Three repos around an OpenSpec store, with an adapted Project Factory harness

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** product owner (parent)

## Context

The PRD splits delivery into `docs`, `backend` and `frontend` repositories
(TC-4, D-20) and asks for spec-driven development with OpenSpec **stores**
(TC-7, OQ-10). Project Factory (github.com/koldovsky/project-factory) brings
the delivery loop we want — numbered requirements, gates as exit-coded
commands, maker ≠ checker review, trace chain, honesty checks — but runs in a
single Node repo: every check reads `docs/requirements.md`, `openspec/` and
`app|lib|src` from the current directory, and no multi-repo mode exists
upstream (PRD §14 risk).

## Decision

1. **The docs repo is the OpenSpec store `doucko`** (`.openspec-store/store.yaml`
   at its root). It owns requirements, the capability plan, product-level
   specs, cross-repo contract changes, `api/openapi.yaml`, and ADRs.
2. **Code repos keep their own `openspec/` root** for implementation-level
   changes and declare `references: [doucko]` (read-only context in
   `openspec instructions`); they never use a `store:` pointer, so
   apply/review/archive stay scoped to the repo (per the OpenSpec stores guide).
3. **Code repos pin the store as a git submodule at `contract/`** (the build
   needs `api/openapi.yaml`; the gates need requirements + plan at the same
   pinned version as CI). Before remotes exist, gates fall back to the
   sibling `../docs` checkout with a visible UNPINNED warning; CI refuses to
   run without the submodule.
4. **The harness source lives in `docs/factory/`** and is installed into each
   repo by `factory/install.mjs --repo=<role>` (the multi-repo replacement for
   `/project-factory:init`). Scripts become config-driven through
   `factory.config.json` (repo role, contract paths, product-code and test
   patterns for Kotlin/TS, battery, hook rules, content guards).
5. **Ownership is data:** the capability plan's `Repo(s)` column assigns each
   requirement to repos; code-repo checks audit only what they own, and a new
   docs-only check, `check-workspace`, joins all repos so no requirement or
   verification method falls between them.
6. **Worksets** (`openspec workset`) are personal and uncommitted: one per
   machine opens all three repos together in the editor.

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **Store + references + pinned contract (chosen)** | product truth in one place; each repo applies/archives independently; CI reproducible via the pin | beta OpenSpec feature (pin CLI 1.13.2); submodule bump discipline |
| Code repos with `store: doucko` pointer | no local openspec/ | all changes and tasks land in the store; OpenSpec does not route tasks to repos |
| Monorepo | upstream Factory works unmodified | contradicts TC-4 and the capstone setup |
| Plain OpenSpec, no Factory gates | least work | loses the exit-coded gates and honesty checks (BC-3 evidence) |

## Consequences

- Updating the harness = edit `factory/`, re-install into each repo, reseal
  the integrity lock in a `Refs: PD-x` commit.
- Every contract change needs a pin bump in the code repos; `check-workspace`
  warns when a pin lags the docs HEAD.
- OpenSpec stores are beta: the CLI is pinned per repo; re-check
  `openspec doctor` after any upgrade.
