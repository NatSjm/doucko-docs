# Improvement Proposal: improve-PD-1

- **Defect:** PD-1 (`docs/qa/process-defects.json`). The harness Maven launcher fails in agent shells: with `NoDefaultCurrentDirectoryInExePath=1`, cmd.exe cannot find the bare `mvnw.cmd`, so agent-run hooks and `qa-verify` cannot run Maven (COR-1).
- **Class / severity:** wrong-claim / P1
- **Status:** draft

## Scope

**Changes:** how `factory/scripts/mvnw.mjs` names the Windows wrapper. It
spawns `.\mvnw.cmd` (explicit relative path) instead of the bare `mvnw.cmd`,
so cmd.exe no longer depends on searching the current directory. With the
fix, the header claim on line 3 ("the same command works in
cmd.exe/PowerShell (mvnw.cmd), Git Bash and CI") becomes true, and the
header needs no edit.

**Does NOT change:**
- the non-Windows branch (`./mvnw`)
- the missing-wrapper check (line 11, which still tests `mvnw.cmd`)
- the SKIP-pending/NOT-EARNED `Result:` line
- `shell: win`
- any gate, hook or qa-verify classification

The auditor also found that no G0 check runs the launcher under the
agent-shell environment. That is a separate proposal if a human wants one;
it is not included here.

## Target file

`factory/scripts/mvnw.mjs` (source, docs repo).

Rollout note, not a second file in this commit: the installed copy
`../backend/scripts/mvnw.mjs` must be refreshed with `npm run factory:install`
and committed in the backend repo. Otherwise the backend's
`factory:check` / harness-drift reports drift. If the backend integrity lock
covers `scripts/mvnw.mjs`, that backend commit probably also needs the
`Refs: PD-1` trailer. The auditor could not verify this: it has no shell,
and the backend lock list is outside its read set.

## Exact diff

The diff is taken verbatim from `docs/qa/evidence/pd-mvnw-shim-proof.md`
(lines 19-33). The auditor checked its context lines against
`factory/scripts/mvnw.mjs` lines 7-13, and they match exactly. The evidence
ran the command as `diff -u scripts/mvnw.mjs <proposed>` on the backend
installed copy. The `a/`/`b/` headers name the factory source, which the
maker states is byte-identical to that copy. The auditor did not check the
byte-identity. Before approval, confirm it with
`node factory/install.mjs --repo=backend --check` or a hash compare.

```diff
--- a/factory/scripts/mvnw.mjs
+++ b/factory/scripts/mvnw.mjs
@@ -7,7 +7,9 @@
 import { existsSync } from "node:fs";
 
 const win = process.platform === "win32";
-const wrapper = win ? "mvnw.cmd" : "./mvnw";
+// Explicit relative path: cmd.exe does not search the current directory when
+// NoDefaultCurrentDirectoryInExePath is set (agent shells set it).
+const wrapper = win ? ".\\mvnw.cmd" : "./mvnw";
 if (!existsSync(win ? "mvnw.cmd" : "mvnw")) {
   console.error(
     "mvnw: Maven wrapper not found — the backend is not scaffolded yet. Generate it (Spring Initializr: Kotlin, Maven, Java 21) " +
```

## Expected metric movement

- **Metric:** `openCorrections`, plus the backend Maven-backed members'
  exit status in agent shells.
- **Current:** 1 correction on disk (COR-1, disposition null). The
  docs digest reports 0 because it is stale (PD-6). In agent shells the
  launcher exits 1 ("'mvnw.cmd' is not recognized...").
- **Expected after fix:** `openCorrections` 1 -> 0. Agent-shell `node
  scripts/mvnw.mjs <goal>` goes from exit 1 to the goal's real exit code.
  The backend hook and qa-verify Maven members stop failing for
  environmental reasons.
- **Verified by:** the NEXT retro reads the same metric. **No movement =
  auto-flag this improvement for revert.**

## EXECUTED red→green proof

**Source:** `docs/qa/evidence/pd-mvnw-shim-proof.md`, lines 34-48. The
orchestrator captured it on 2026-09-28 on the Windows 10 dev machine, in
the backend repo. `<proposed>` was a temporary copy of the launcher with
the diff above applied, and it was deleted after the run. The RED message is
Russian-locale cmd.exe output. The evidence file translates it as "'mvnw.cmd'
is not recognized as an internal or external command, operable program or
batch file."

Pasted verbatim from the evidence file:

```text
$ NoDefaultCurrentDirectoryInExePath=1 node scripts/mvnw.mjs -v    # RED: installed launcher
"mvnw.cmd" не является внутренней или внешней
командой, исполняемой программой или пакетным файлом.
exit 1

$ NoDefaultCurrentDirectoryInExePath=1 node <proposed> -v    # GREEN
Apache Maven 3.9.16 (2bdd9fddda4b155ebf8000e807eb73fd829a51d5)
exit 0

$ node <proposed> -v    # GREEN, variable unset (user terminal)
Apache Maven 3.9.16 (2bdd9fddda4b155ebf8000e807eb73fd829a51d5)
exit 0

$ NoDefaultCurrentDirectoryInExePath=1 node <proposed> -q -B spotless:check    # GREEN, real goal
exit 0
```

**What this proof does and does not cover:**
- It covers the RED behaviour of the current launcher, and the GREEN
  behaviour of the patched launcher with the variable set, with it unset,
  and on a real goal (`spotless:check`).
- The maker (the orchestrator) ran it, not a checker. The auditor has not
  re-run it and has no shell.
- **No red/green fixture or `tests/*.test.mjs` exists** for the launcher. The
  template's fixture form (`tests/fixtures/mvnw/red|green/` plus
  `node tests/mvnw.test.mjs`) has not been written or executed. The human
  approver decides whether this manual, executed proof is enough for a
  launcher fix (no check logic changes), or whether a fixture test must land
  first.
- The non-Windows branch is unchanged, so no Linux/CI proof is needed for
  this diff.

## Rollback (one revert)

- **Single commit:** yes. The docs-repo change is one commit, and rollback is
  `git revert <sha>`. After a revert, re-run `npm run factory:install` in
  ../backend and commit there, so the installed copy does not drift from the
  source.
- **State to clean up on revert:** the backend installed copy
  (`../backend/scripts/mvnw.mjs`). No baselines or reports are written.
- **Ladder position:** n/a. This fixes a launcher; it adds no new check. If
  the approver wants the fixture test from the proof section, that test
  enters at experimental.

## Approval & trailer convention

- Human approver: `<name>` · Date: `<YYYY-MM-DD>`
- Commit message MUST end with the trailer line: `Refs: PD-1`
- On landing, set COR-1's `disposition` and flip PD-1 `status` to
  `resolved` only after the next digest shows the metric moved.
