# Doučko Factory — multi-repo delivery harness

An adaptation of [Project Factory](https://github.com/koldovsky/project-factory)
(self-improving edition, MIT, © Vyacheslav Koldovskyy) for a delivery split
across **three repositories** with **OpenSpec stores**, a **Kotlin/Spring
Boot/Maven** backend and a **React/Vite/TS** frontend. Decision record:
[ADR-0002](../docs/adr/0002-multi-repo-openspec-store-and-factory-harness.md).

- [PLAYBOOK.md](PLAYBOOK.md) — phases 0–8, who does what, in which repo
- [GATES.md](GATES.md) — G0–G8 as commands per repo
- [UPSTREAM.md](UPSTREAM.md) — what was taken, adapted, added, dropped
- [RULES-CHANGELOG.md](RULES-CHANGELOG.md) — check promotion ladder (installed per repo)

## Layout

```
C:\projects\school-tutor\          (workspace folder — not a repo)
├── docs\       OpenSpec STORE "doucko" + harness source (this folder)
├── backend\    Kotlin + Spring Boot + Maven   — openspec/ references doucko
└── frontend\   React + Vite + TS              — openspec/ references doucko
```

| Piece | Source (here) | Installed into each repo as |
|---|---|---|
| Gate scripts (traceability, trajectory, acceptance join, ratchets, integrity, qa-verify, gate-status, ledger, corrections) | `scripts/*.mjs` | `scripts/*.mjs` |
| Shared config library | `scripts/lib/factory-config.mjs` | `scripts/lib/` |
| Cross-repo join (docs only) | `scripts/check-workspace.mjs` | `scripts/` |
| Maven launcher (backend only) | `scripts/mvnw.mjs` | `scripts/` |
| Git hooks (pre-commit, commit-msg) + Claude PostToolUse hook | `hooks/` | `scripts/hooks-*.mjs`, `.githooks/`, `.claude/settings.json` |
| Subagents (by repo role) | `agents/` | `.claude/agents/` |
| Workflows (by repo role) | `workflows/` | `.claude/workflows/` |
| Per-repo config (seed) | `templates/config/<repo>.factory.config.json` | `factory.config.json` |
| CI (seed) | `ci/<repo>.yml` | `.github/workflows/ci.yml` |
| Lessons | `lessons/` | upserted into `AGENTS.md` |

## How the three repos share one requirement chain

```
docs/requirements.md ── FR/NFR ids + Verification tags
        │
docs/mvp-capability-plan.md ── | Req | Slice | Repo(s) |   ← ownership is data
        │
openspec/specs/<cap>/spec.md (store) ── cites FR ids
        │ references: [doucko]  +  contract/ submodule (pinned)
        ▼
backend/openspec/changes/implement-*-api     frontend/openspec/changes/implement-*-ui
backend/src/test/**/*Test.kt  // @trace FR-x  frontend/src/**/*.test.ts, e2e/*.spec.ts
backend trace/trace.json                     frontend trace/trace.json + recordings
        └──────────────── docs: scripts/check-workspace.mjs joins both ───────┘
```

- Each code repo's gates audit **only the requirements the plan assigns to
  it**, and only the verification methods it proves (`acceptanceMethods`:
  backend `local-verifiable`; frontend `local-verifiable, e2e, recording,
  vision-verify, a11y, eval`).
- `check-workspace` (docs) fails when a requirement has no owner repo, or when
  a declared method is proven by none of its owners, and it warns (or fails
  under `--strict-tests` / `--release`) when an owner repo lacks `@trace` tests.
  It also reports each code repo's `contract/` pin against the docs HEAD.

## One-time setup on a machine

Prerequisites: Git, Node ≥ 20, JDK 21 (backend), Docker Desktop (compose,
Testcontainers), VS Code or Cursor for worksets.

```bash
# 1. OpenSpec CLI: repos pin 1.13.2 (npx openspec …). The /opsx:* slash
#    commands call the GLOBAL `openspec`, so upgrade it too (1.4.1 has no stores):
npm install -g @fission-ai/openspec@1.13.2

# 2. Register the store on this machine (once per clone):
openspec store register C:/projects/school-tutor/docs --id doucko --yes

# 3. In each repo: install deps (+ harness, if updating)
cd C:/projects/school-tutor/docs     && npm install
cd C:/projects/school-tutor/backend  && npm install
cd C:/projects/school-tutor/frontend && npm install

# 4. Open all three together (personal, never committed):
openspec workset create doucko --member C:/projects/school-tutor/docs --member C:/projects/school-tutor/backend --member C:/projects/school-tutor/frontend --tool code
openspec workset open doucko
```

When the repos get remotes:

```bash
# docs: record the clone URL in the store identity (teammates' doctor fixes)
#   edit .openspec-store/store.yaml → add `remote: <docs-url>`
# backend + frontend: pin the contract (CI requires it), and point the reference at the remote
git submodule add <docs-url> contract
#   openspec/config.yaml → references: [{ id: doucko, remote: "<docs-url>" }]
```

## Everyday commands (any repo, from its root)

```bash
npm run qa:verify        # the repo's battery → docs/qa/automated-verification-latest.md
npm run gate:status      # G0–G8, three-valued
npm run check:trace      # requirement chain → docs/qa/traceability-report.md
npx openspec doctor      # store/reference health
npm run factory:check    # installed harness vs factory/ source
npm run correct -- "..." # record a human correction of a factory claim
```

Docs repo only: `npm run check:workspace` (cross-repo join).

## Running workflows

The workflows in `.claude/workflows/` (`spec-pipeline`, `review-gate`,
`eval-suite`, …) run through `scripts/run-workflow.mjs`, because a Claude
Code session may have no native workflow engine. Every `agent()` step is a
fresh headless `claude -p` session (maker ≠ checker holds): `agentType`
becomes `--agent <type>` from `.claude/agents/`, untyped steps get read-only
tools, and `schema` becomes `--json-schema`.

```bash
npm run workflow -- spec-pipeline --args-file <args.json> --dry-run   # wiring check, no API calls
npm run workflow -- spec-pipeline --args-file <args.json> --max-total-usd 15
```

- Needs a signed-in Claude Code CLI on the machine (`claude` → `/login`).
  An unauthenticated CLI stops the run at the first step with a clear error.
- Each step is billed. Caps: `--budget-usd` per step (default 2),
  `--max-total-usd` per run (default 20); `--concurrency` (default 4).
- Each run writes `trace/workflow-runs/<stamp>-<name>.json` (every step's
  label, agent, duration, cost, session id, result) and a `workflow-run`
  ledger event. Commit real-run records as evidence; dry runs are scratch.
- Steps that write files run with `--permission-mode acceptEdits` and the
  tools their agent definition grants (e.g. `spec-writer` has Bash).

## Updating the harness

1. Edit the source under `docs/factory/` (never an installed copy).
2. In each repo: `npm run factory:install` (backend/frontend call
   `../docs/factory/install.mjs`), run its battery.
3. Reseal each repo's lock: `node scripts/check-factory-integrity.mjs --init-lock --adaptation "<what changed>"`
   and commit with `Refs: PD-<n>` (the integrity check treats unsealed
   gate-script drift without such a commit as tampering).

## Known limits (honest list)

- OpenSpec stores/worksets are **beta**; the CLI is pinned to 1.13.2 in every
  repo. The `claude` workset opener is disabled upstream — use `--tool code`
  or `--tool cursor`.
- Before the `contract/` submodule exists, code repos read `../docs` and
  every check prints an UNPINNED warning. CI fails until the pin exists.
- The upstream parity/pixel-diff layer, visual-fidelity check and scheduled
  automations were not carried over (no pixel-parity requirement; MVP needs
  no watchers) — see UPSTREAM.md.
- The upstream fixture test-suite (`tests/`) was not carried over; the
  adapted scripts were smoke-tested on the real repos (see UPSTREAM.md).
