# Evidence: G2 rendered PASS over zero specs (COR-2 → PD-8)

Raw, executed output, captured 2026-10-03 (Europe/Prague) by the orchestrator
on the Windows 10 dev machine. Input for the process-auditor; not a verdict.

## Defect

Before the first product spec exists, `check-traceability` downgrades every
"FR not cited by a spec" to a warning (by design: specs are a Phase 2
output). But it printed **no `Result:` line** on stdout, exited 0, and printed
`Scope: <MVP FR count>`. `gate-status`'s `runCheck` falls back to
"exit 0 and Scope ≠ 0 → PASS", so G2 ("baseline specs") and G8 ("UAT, trace
regressions") rendered **PASS while 0 of 48 MVP FRs were cited by any spec**.
The generated `docs/qa/traceability-report.md` also said `Result: PASS`.
Affected all three repos (each runs the same installed script).

Class: vacuous-pass (lesson vacuous-pass-not-earned). Gate that should have
caught it: G2.

## Fix (factory source; installed copies are byte-identical)

```diff
--- a/factory/scripts/check-traceability.mjs
+++ b/factory/scripts/check-traceability.mjs
@@ -133,4 +133,8 @@
 const specsStarted = specFileCount > 0;
+// Before the first spec the FR -> spec chain is unchecked, not proven: the
+// verdict is SKIP-pending, never PASS (COR-2 — gate-status read the old
+// exit-0 + "Scope: <MVP FR count>" as a G2 PASS over zero specs).
+const specChainPending = !specsStarted && !flags.has("--release");
@@ -251,5 +255,5 @@  (generated report)
-Result: ${failures.length === 0 ? "PASS" : `FAIL (...)`}...
+Result: ${failures.length ? `FAIL (...)` : specChainPending ? "SKIP-pending (no product spec yet - the FR -> spec chain is unchecked)" : "PASS"}...
@@ -303,4 +307,8 @@ function finish() {
+  // Declared verdict for gate-status / qa-verify (three-valued, RC2).
+  if (failures.length) console.log("Result: FAIL");
+  else if (specChainPending) console.log(`Result: SKIP-pending (0 spec files under ${specRoots.join(" or ")} - FR -> spec chain unchecked; expected before Phase 2)`);
+  else console.log("Result: PASS");
```

Exit codes are unchanged (pre-commit is not affected). Once a spec exists the
script declares `PASS`/`FAIL` exactly as `gate-status` inferred before. With
`--release` an uncited FR was already a FAIL and stays one.

## RED (before the fix)

```text
docs$ node scripts/check-traceability.mjs
Scope: 48 MVP FR(s) (repo docs, contract self)
traceability: 48 MVP FRs checked — 0 failure(s), 53 warning(s)
exit=0                                   # no Result: line at all

docs$ node scripts/gate-status.mjs
  G2  PASS           baseline specs  [traceability]
  G8  PASS           UAT (trace regressions)  [traceability]

backend$  node scripts/gate-status.mjs  →  G2  PASS  baseline specs  [traceability]
frontend$ node scripts/gate-status.mjs  →  G2  PASS  baseline specs  [traceability]
```

## GREEN (after the fix, re-installed with `factory/install.mjs`)

```text
docs$ node scripts/check-traceability.mjs
Scope: 48 MVP FR(s) (repo docs, contract self)
Result: SKIP-pending (0 spec files under openspec/specs - FR -> spec chain unchecked; expected before Phase 2)
exit=0

docs$ node scripts/gate-status.mjs
  G2  SKIP-pending   baseline specs  [traceability]
  G8  SKIP-pending   UAT (trace regressions)  [traceability]

backend$ node scripts/check-traceability.mjs
Result: SKIP-pending (0 spec files under ../docs/openspec/specs or openspec/specs - FR -> spec chain unchecked; expected before Phase 2)
backend$ node scripts/gate-status.mjs
  G2  NOT-EARNED     baseline specs  [traceability]      # product code exists → vacuity flip

frontend$ (same as backend)
  G2  NOT-EARNED     baseline specs  [traceability]
```

## Not checked

- No fixture test exists for `check-traceability` itself; the proof is the
  executed before/after run above.
- The integrity lock in each repo is re-sealed with `--init-lock` inside the
  `Refs: PD-8` commit; only `scripts/check-traceability.mjs` had drifted
  (`check-factory-integrity` listed no other file).
