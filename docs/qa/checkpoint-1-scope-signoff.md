# Checkpoint 1 — Scope sign-off (G1)

| | |
|---|---|
| **Date** | 2026-10-02 (Europe/Prague) |
| **Signed off by** | Product owner (parent), in the Claude Code chat |
| **Answer, verbatim** | "use defaults" |
| **Applies to** | `docs/requirements.md` §6, OQ-1..OQ-27 — every recommended default accepted |
| **Branch / draft commit** | `phase1-framing`, draft at `0772417` |

## What the sign-off changed in `docs/requirements.md`

| Decision | Effect |
|---|---|
| OQ-18 | Appended FR-55 (edit content), FR-56 (delete only when no attempt references it) |
| OQ-19 | Appended FR-57 (mission publishing rules) |
| OQ-25 | Appended FR-58 (dark/light theme follows the OS) |
| OQ-23 | Appended NFR-15 (admin session), NFR-16 (admin password policy) |
| OQ-24 | Appended NFR-17 (upload limits) |
| OQ-26 | Amended NFR-10: `make backup` → cross-platform `npm run backup`. The laptop OS question was not answered, so the cross-platform default stands. |
| OQ-27 | Amended NFR-8: Verification `eval` → `recording` |
| OQ-10 | Recorded as resolved by ADR-0002 |
| OQ-1..9, 11..17, 20..22 | Clarifications of existing requirements; binding for the Phase 2 specs |

No existing id was renumbered or removed.

## Evidence

- `node scripts/gate-status.mjs` — G1 is a judgment gate and always prints
  "needs sign-off"; this file is the sign-off it asks for.
- `node scripts/check-traceability.mjs` — parses the MVP FR set from
  `docs/requirements.md` (Scope line).

## Not covered by this sign-off

- No product spec exists yet. Phase 2 (G2) is not started, whatever
  `gate-status` prints for G2.
- Verification mechanisms for `e2e`, `recording`, `vision-verify` and `a11y`
  do not exist yet; they are due before Phase 4 (G3 existence mode).
