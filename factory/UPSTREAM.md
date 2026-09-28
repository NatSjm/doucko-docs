# Provenance — what came from Project Factory, and what changed

- **Upstream:** https://github.com/koldovsky/project-factory (branch `master`,
  commit `0d7286a187df7ca22af80be78c9bd32491f5a781`, "Self-Improving Project
  Factory"). MIT © 2026 Vyacheslav Koldovskyy — license kept in
  `LICENSE.upstream`.
- **Taken on:** 2026-09-28.

## Adopted as-is (semantics unchanged)

| Upstream | Here |
|---|---|
| Three-valued gates (PASS / NOT-EARNED / FAIL + SKIP-pending), vacuity flip, stub scan, committed-evidence boundary | all scripts |
| `ledger.reference.mjs`, `ledger-report`, `correct`, `check-eval-ratchet`, `check-a11y`, `record-demos` | `scripts/` (only product-code detection swapped to the config library where it existed) |
| Agents `eval-judge`, `vision-judge`, `qa-documenter`, `process-auditor` | `agents/` |
| Workflows `review-gate`, `spec-pipeline`, `eval-suite`, `trajectory-eval`, `vision-verify`, `uat-triage` | `workflows/` |
| Retro schemas + improvement template; telemetry config; process baseline | `templates/retro/`, `templates/quality/` |
| Lessons `vacuous-pass-not-earned`, `declared-method-needs-mechanism`, `done-claims-need-evidence` (payloads only) | `lessons/` |
| Requirements template (FR/NFR/TC/BC + closed Verification vocabulary), ADR, QA-pack, context-architecture templates | `templates/docs/` |

## Adapted (multi-repo + Kotlin/Maven + React/Vite)

| Upstream | Change | Why |
|---|---|---|
| Hardcoded `docs/requirements.md`, `openspec/specs`, `app\|lib\|src` in every script | `scripts/lib/factory-config.mjs` + per-repo `factory.config.json`: contract paths (pinned `contract/` submodule, or `../docs` with an UNPINNED warning), product-code dirs/extensions (adds `.kt`), vendored-code exclusion (`src/design-system/`), test patterns (`*Test.kt`, `*IT.kt`) | three repos, two stacks |
| `check-traceability` | reads requirements/plan/store specs from the contract; counts store + local spec citations; test-trace only for FRs the plan assigns to this repo; docs repo additionally requires a `Repo(s)` owner per MVP FR | ownership across repos |
| `check-acceptance-methods` | audits only (id, method) pairs owned by this repo; Maven `pomPlugins` mechanisms; parses the table's last column as a Verification list | upstream missed bare `e2e`/`a11y`/`eval`/`recording` tags in the column |
| `check-coverage-ratchet` | JaCoCo XML reader alongside istanbul json-summary | Maven backend |
| `check-trajectory` | module scope regex per stack (`cz/doucko/<module>/`, `src/features/<domain>/`) | no `lib/<domain>/` |
| `check-factory-integrity` | also locks `factory.config.json`, `scripts/lib/*`, `scripts/hooks-*.mjs`; stub scan reads the battery from config | the config now defines the battery |
| `qa-verify` | battery from `factory.config.json` (backend runs `mvnw -B verify` via `scripts/mvnw.mjs`) | per-repo battery |
| `gate-status` | G1/G3 read contract paths; `gateKeysExcluded` per role renders `n/a (<repo> role)` (never PASS over nothing); workspace join in G4/G7 | repo roles |
| `templates/hooks/*` | config-driven pre-commit (stack rules with `requires` → honest failure when tooling is missing; NFR-3/NFR-4 content guard), commit-msg (per-repo feature paths), PostToolUse (Spotless/ktlint or ESLint per file) | stacks + privacy/copyright NFRs |
| `commands/init.md` | `install.mjs --repo=<role>` (idempotent; `--check` drift report) | one source, three installs |
| `templates/ci/github-actions.yml` | `ci/{docs,backend,frontend}.yml` (submodules, JDK 21 + Maven, qa-verify battery) | stacks |
| Agents `capability-implementer`, `test-engineer`, `spec-writer` | rewritten for Kotlin/Spring (hexagonal modules, Flyway, Testcontainers, golden table) and React/Vite (design system, generated client), and store vs code-repo OpenSpec roles | stack + stores |
| Agents `code-reviewer`, `security-reviewer`, `spec-compliance-auditor`, `requirements-analyst`, `bug-triage-analyst` | stack- and domain-specific checklist items (NFR-1/2/3/4, answer-key leakage, XP ledger) | domain |
| `MASTER-PROMPT.md`, `checklists/quality-gates.md` | `PLAYBOOK.md`, `GATES.md` (per repo) | topology |
| `templates/docs/mvp-capability-plan`, `current-state`, `openspec/change` | Repo(s) ownership table; per-repo handoff; backend/frontend change skeletons | topology |
| `RULES-CHANGELOG.md` | rows renamed to installed scripts; Doučko history row | provenance |

## Added (no upstream equivalent)

- `scripts/check-workspace.mjs` — cross-repo join (ownership × methods × member evidence × contract pin). Experimental on the ladder.
- `scripts/mvnw.mjs` — cross-platform Maven wrapper launcher with honest pre-scaffold failure.
- `install.mjs` — multi-repo installer + drift check.

## Not adopted (and why)

| Upstream | Reason |
|---|---|
| `check-visual-fidelity`, `check-parity-suite`, `parity-block-loop`, `lib/parity-capture`, lessons `block-conquest-doctrine`, `sampling-blindness`, `capture-determinism` | no pixel-parity requirement (the design system is original, not a reproduction); `pixel-diff` is not in the PRD's vocabulary |
| `scripts/automations/*`, `automations/registry.json`, `templates/ci/automations.yml` | optional, off by default upstream; not needed for a 1-week solo MVP. Revisit after G7 |
| Plugin/adapter packaging (`.claude-plugin`, `.cursor*`, `.codex`, `.github/copilot-*`, `skills/`) | harness is vendored per repo; Claude Code reads `.claude/agents` + `.claude/workflows` + `AGENTS.md` directly |
| Upstream `tests/` fixture suite and lesson `run-fixtures.mjs` | they exercise the upstream script paths; the adapted scripts were smoke-run on the real repos instead. Porting the red→green fixtures is the promotion path for `check-workspace` |
| `templates/AGENTS.template.md` | each repo has a hand-written `AGENTS.md` (role-specific; lessons still upserted) |
