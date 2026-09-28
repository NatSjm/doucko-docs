# Evidence: Maven launcher under NoDefaultCurrentDirectoryInExePath (COR-1)

Raw, executed output, captured 2026-09-28 (Europe/Prague) by the orchestrator
on the Windows 10 dev machine. Nothing here is a verdict: it is input for the
process-auditor.

- **Where:** backend repo (`scripts/mvnw.mjs`, an installed copy of
  `factory/scripts/mvnw.mjs`, byte-identical).
- **Setup:** `<proposed>` is a temporary copy of the launcher with the diff
  below applied. It was deleted after the run, so no sealed file was modified.
- **Translation of the RED message (Russian console):** "'mvnw.cmd' is not
  recognized as an internal or external command, operable program or batch file."
- **Why the variable matters:** the Claude Code shell sets
  `NoDefaultCurrentDirectoryInExePath=1`, so every agent-run hook, `npm run
  verify` and `qa-verify` sees the RED behaviour. A user terminal without the
  variable does not.

```text
$ diff -u scripts/mvnw.mjs <proposed>
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
