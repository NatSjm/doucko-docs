# Doučko Quality Gates G0–G8 (multi-repo)

Upstream `checklists/quality-gates.md`, re-cut per repository. The judgment
criteria (sign-offs, review quality, eval rubrics) are unchanged from
upstream and sit ON TOP of these commands, never instead of them. Every
command must exit 0; a red command is a STOP.

**Three-valued.** Checks print `PASS`, `FAIL`, `NOT-EARNED` or
`SKIP-pending`. Absence of evidence is never success; `npm run gate:status`
renders all gates for the repo it runs in, and prints `n/a (<repo> role)`
for a gate whose every check is excluded by that repo's role
(`gateKeysExcluded` in `factory.config.json`).

**One battery per repo.** `npm run qa:verify` runs the repo's battery from
`factory.config.json` and writes `docs/qa/automated-verification-latest.md`.

| Repo | Battery (qa:verify) highlights |
|---|---|
| docs | traceability (product chain + plan ownership), acceptance **existence**, **workspace join**, harness drift, OpenSpec strict |
| backend | traceability (owned FRs), acceptance artifacts (`local-verifiable`), **`mvnw -B verify`** (compile, ktlint, unit, IT, modulith, JaCoCo), coverage ratchet, OpenSpec strict |
| frontend | traceability (owned FRs), recordings, acceptance artifacts (`e2e`, `recording`, `vision-verify`, `a11y`, `eval`, `local-verifiable`), lint, typecheck, unit + coverage + ratchet, Playwright, eval ratchet, build, OpenSpec strict |

## G0 — Loop installed (each repo)

```bash
node <docs>/factory/install.mjs --repo=<role> --check   # harness not drifted
git config core.hooksPath                               # prints .githooks
node scripts/check-factory-integrity.mjs                # lock present + clean
npx openspec validate --all --strict
npx openspec doctor                                     # code repos: reference doucko ok
```

- [ ] `AGENTS.md` + `CLAUDE.md` (`@AGENTS.md`); ADR-0001 (stack) + ADR-0002 (harness topology) in docs.
- [ ] Store registered on this machine (`openspec store list` shows `doucko`).
- [ ] Code repos: scaffold builds (`npm run verify` backend / `npm run build` frontend).
- [ ] Code repos: `contract/` submodule pinned (required by CI).

## G1 — Product framing (docs)

- [ ] `docs/product-brief.md` + `docs/requirements.md`; every FR/NFR row numbered, phase-tagged, and ends with Verification tag(s).
- [ ] **Scope sign-off** (checkpoint 1).

## G2 — Product specs (docs)

```bash
npx openspec validate --all --strict
node scripts/check-traceability.mjs     # every MVP FR cited by a store spec
```

## G3 — Capability plan (docs + code repos)

```bash
# docs
node scripts/check-traceability.mjs     # every MVP FR planned AND has a Repo(s) owner
node scripts/check-workspace.mjs        # no orphan (id, method) between repos
# backend, frontend (after bumping contract/)
node scripts/check-acceptance-methods.mjs --mode=existence
```

- [ ] **Plan approval** (checkpoint 2).

## G4 — Per slice (implementing repo, then docs)

```bash
npm run qa:verify                       # the repo battery
npx openspec validate --all --strict
node scripts/check-trajectory.mjs       # review evidence clean, Slice: trailer, module scope
node scripts/check-factory-integrity.mjs
# docs
node scripts/check-workspace.mjs
```

- [ ] Change validated strictly before implementation; tests red → green, none weakened.
- [ ] `review-gate` clean → `review-findings.json` persisted; archived; `docs/current-state.md` updated; commit carries `Slice:` + `Refs:`.

## G5 — Hardening

```bash
# backend
node scripts/mvnw.mjs -B verify && node scripts/check-coverage-ratchet.mjs --update
# frontend
npm run test:coverage && node scripts/check-coverage-ratchet.mjs --update
npm run test:e2e                        # against docker compose
```

## G6 — QA proof (frontend + docs)

```bash
# frontend
node scripts/record-demos.mjs && node scripts/check-recordings.mjs
node scripts/check-a11y.mjs             # light + dark (NFR-13)
node scripts/check-acceptance-methods.mjs --mode=artifact
node scripts/check-eval-ratchet.mjs --update
# plus: vision-verify + eval-suite workflows (fresh judges)
```

## G7 — Release (every repo, then docs)

```bash
npm run qa:verify
node scripts/check-traceability.mjs --release --strict-tests            # frontend adds --strict-recordings
node scripts/check-traceability.mjs --check-fresh
node scripts/check-trajectory.mjs --release --check-fresh
node scripts/check-process-ratchet.mjs --release
node scripts/check-factory-integrity.mjs
node scripts/correct.mjs --check
# docs
node scripts/check-workspace.mjs --release --strict-tests
```

- [ ] `deploy-gated` items verified on the laptop compose stack and recorded (never silently skipped).
- [ ] Process-defects reviewed; no open corrections; CI green in all three repos.

## G8 — UAT round

```bash
npm run qa:verify                        # in each repo that received a fix
node scripts/check-traceability.mjs      # every BUG-n fix has a @trace'd regression test
```
