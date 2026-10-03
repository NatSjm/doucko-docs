#!/usr/bin/env node
// Doučko factory installer — the multi-repo replacement for upstream
// `/project-factory:init` (commands/init.md). Run it FROM THE TARGET REPO ROOT:
//
//   node ../docs/factory/install.mjs --repo=backend      # install / update
//   node ../docs/factory/install.mjs --repo=backend --check   # drift report, exit 1 on drift
//   node factory/install.mjs --repo=docs                 # the docs repo installs from itself
//
// What it does (idempotent):
//   - framework-owned files are copied from factory/ and OVERWRITTEN when they
//     differ (scripts/check-*.mjs, qa-verify, gate-status, ledger*, correct,
//     scripts/lib/, scripts/hooks-*.mjs, .githooks/*, .claude/agents/*,
//     .claude/workflows/*) — per the repo's role (ROLES below);
//   - project-owned files are created ONLY if absent (factory.config.json,
//     RULES-CHANGELOG.md, quality/*.json, templates/retro/*, .github/workflows/ci.yml);
//   - structured config is MERGED add-missing-only (package.json scripts +
//     devDependencies, .claude/settings.json hooks);
//   - AGENTS.md lessons are upserted inside the FACTORY-LESSONS markers;
//   - git core.hooksPath is pointed at .githooks.
//
// After an install/update, RESEAL the integrity lock (post-adaptation G0):
//   node scripts/check-factory-integrity.mjs --init-lock --adaptation "<note>"
// Once the lock exists, updating gate-bearing files is an improvement: land it
// in a commit carrying `Refs: PD-<n>` (see RULES-CHANGELOG.md).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const FACTORY = dirname(fileURLToPath(import.meta.url));
const target = process.cwd();
const argv = process.argv.slice(2);
const repo = argv.find((a) => a.startsWith("--repo="))?.slice(7);
const CHECK = argv.includes("--check");
const OPENSPEC_VERSION = "1.13.2";

const ROLES = {
  docs: {
    scripts: ["check-workspace"],
    agents: ["requirements-analyst", "spec-writer", "spec-compliance-auditor", "process-auditor", "qa-documenter", "bug-triage-analyst"],
    workflows: ["spec-pipeline", "uat-triage"],
    ci: "docs.yml",
    pkgScripts: {
      check: "npm run qa:verify",
      "check:workspace": "node scripts/check-workspace.mjs",
      "factory:check": "node factory/install.mjs --repo=docs --check",
      "factory:install": "node factory/install.mjs --repo=docs",
    },
    dirs: [],
  },
  backend: {
    scripts: ["check-coverage-ratchet", "mvnw"],
    agents: ["spec-writer", "capability-implementer", "test-engineer", "code-reviewer", "security-reviewer", "spec-compliance-auditor", "process-auditor", "bug-triage-analyst"],
    workflows: ["review-gate", "trajectory-eval"],
    ci: "backend.yml",
    pkgScripts: {
      check: "npm run qa:verify",
      verify: "node scripts/mvnw.mjs -B verify",
      "test:run": "node scripts/mvnw.mjs -q test",
      "check:coverage": "node scripts/check-coverage-ratchet.mjs",
      "factory:check": "node ../docs/factory/install.mjs --repo=backend --check",
      "factory:install": "node ../docs/factory/install.mjs --repo=backend",
    },
    dirs: [],
  },
  frontend: {
    scripts: ["check-coverage-ratchet", "check-recordings", "check-a11y", "record-demos", "check-eval-ratchet"],
    agents: [
      "spec-writer", "capability-implementer", "test-engineer", "code-reviewer", "security-reviewer",
      "spec-compliance-auditor", "process-auditor", "bug-triage-analyst", "eval-judge", "vision-judge", "qa-documenter",
    ],
    workflows: ["review-gate", "trajectory-eval", "eval-suite", "vision-verify"],
    ci: "frontend.yml",
    pkgScripts: {
      check: "npm run qa:verify",
      "check:coverage": "node scripts/check-coverage-ratchet.mjs",
      "check:recordings": "node scripts/check-recordings.mjs",
      "check:a11y": "node scripts/check-a11y.mjs",
      "check:eval": "node scripts/check-eval-ratchet.mjs",
      "qa:record-demos": "node scripts/record-demos.mjs",
      "qa:record-proof": "node scripts/record-demos.mjs",
      "factory:check": "node ../docs/factory/install.mjs --repo=frontend --check",
      "factory:install": "node ../docs/factory/install.mjs --repo=frontend",
    },
    dirs: ["evals/cases", "evals/results"],
  },
};
const COMMON_SCRIPTS = [
  "check-traceability", "check-trajectory", "check-acceptance-methods", "check-process-ratchet",
  "check-factory-integrity", "qa-verify", "gate-status", "ledger", "ledger-report", "correct",
  "run-workflow",
];
const COMMON_PKG_SCRIPTS = {
  "qa:verify": "node scripts/qa-verify.mjs",
  "gate:status": "node scripts/gate-status.mjs",
  "check:trace": "node scripts/check-traceability.mjs",
  "check:trajectory": "node scripts/check-trajectory.mjs",
  "check:acceptance": "node scripts/check-acceptance-methods.mjs --mode=existence",
  "check:acceptance:artifact": "node scripts/check-acceptance-methods.mjs --mode=artifact",
  "check:process": "node scripts/check-process-ratchet.mjs",
  "check:integrity": "node scripts/check-factory-integrity.mjs",
  correct: "node scripts/correct.mjs",
  "retro:digest": "node scripts/ledger-report.mjs",
  workflow: "node scripts/run-workflow.mjs",
};
const COMMON_DIRS = ["docs/adr", "docs/qa/waivers", "trace", "retro/corrections", "quality"];

if (!ROLES[repo]) {
  console.error(`usage: node <factory>/install.mjs --repo=${Object.keys(ROLES).join("|")} [--check]`);
  process.exit(2);
}
const role = ROLES[repo];

// ---------- the install plan: [source (in factory/), dest (in target), mode] ----------
// mode: "owned" = framework-owned (overwrite on drift, checked by --check)
//       "seed"  = project-owned (create only if absent)
const plan = [];
const owned = (src, dest) => plan.push({ src, dest, mode: "owned" });
const seed = (src, dest) => plan.push({ src, dest, mode: "seed" });
for (const s of [...COMMON_SCRIPTS, ...role.scripts]) owned(`scripts/${s}.mjs`, `scripts/${s}.mjs`);
owned("scripts/lib/factory-config.mjs", "scripts/lib/factory-config.mjs");
for (const h of ["pre-commit", "commit-msg", "post-edit"]) owned(`hooks/${h}.mjs`, `scripts/hooks-${h}.mjs`);
owned("hooks/githooks/pre-commit", ".githooks/pre-commit");
owned("hooks/githooks/commit-msg", ".githooks/commit-msg");
for (const a of role.agents) owned(`agents/${a}.md`, `.claude/agents/${a}.md`);
for (const w of role.workflows) owned(`workflows/${w}.js`, `.claude/workflows/${w}.js`);
seed(`templates/config/${repo}.factory.config.json`, "factory.config.json");
seed("RULES-CHANGELOG.md", "RULES-CHANGELOG.md");
seed("templates/quality/telemetry.config.json", "quality/telemetry.config.json");
seed("templates/quality/process-baseline.json", "quality/process-baseline.json");
for (const f of ["correction.schema.json", "process-defects.schema.json", "improvement.template.md"]) seed(`templates/retro/${f}`, `templates/retro/${f}`);
seed(`ci/${role.ci}`, ".github/workflows/ci.yml");
if (repo === "frontend") seed("templates/evals-README.md", "evals/README.md");

const norm = (t) => t.replace(/\r\n/g, "\n");
const same = (a, b) => existsSync(b) && norm(readFileSync(a, "utf8")) === norm(readFileSync(b, "utf8"));

// ---------- --check: drift of framework-owned files ----------
if (CHECK) {
  const drift = [];
  for (const { src, dest, mode } of plan) {
    if (mode !== "owned") continue;
    if (!same(join(FACTORY, src), join(target, dest))) drift.push(`${dest}${existsSync(join(target, dest)) ? " (differs from factory/" + src + ")" : " (missing)"}`);
  }
  for (const d of drift) console.error(`DRIFT ${d}`);
  console.log(`Scope: ${plan.filter((p) => p.mode === "owned").length} framework-owned file(s) (repo ${repo})`);
  console.log(
    drift.length
      ? `Result: FAIL — ${drift.length} installed file(s) differ from the factory source. Edit factory/ (the source), then re-run install; never hand-edit installed copies.`
      : "Result: PASS",
  );
  process.exit(drift.length ? 1 : 0);
}

// ---------- install ----------
const report = [];
for (const d of [...COMMON_DIRS, ...role.dirs]) mkdirSync(join(target, d), { recursive: true });
for (const { src, dest, mode } of plan) {
  const from = join(FACTORY, src);
  const to = join(target, dest);
  if (!existsSync(from)) {
    report.push(["MISSING-SOURCE", dest]);
    continue;
  }
  if (existsSync(to) && (mode === "seed" || same(from, to))) {
    report.push(["kept", dest]);
    continue;
  }
  const action = existsSync(to) ? "updated" : "added";
  mkdirSync(dirname(to), { recursive: true });
  // Text files are written with LF so hashes/diffs are stable across OSes.
  writeFileSync(to, norm(readFileSync(from, "utf8")));
  report.push([action, dest]);
}
for (const keep of [".gitkeep"]) {
  for (const d of ["docs/qa/waivers", "retro/corrections", "trace", ...(repo === "frontend" ? ["evals/cases", "evals/results"] : [])]) {
    const p = join(target, d, keep);
    if (!existsSync(p) && readdirSync(join(target, d)).length === 0) writeFileSync(p, "");
  }
}

// package.json — add missing scripts/devDependencies only.
{
  const p = join(target, "package.json");
  const pkg = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { name: `doucko-${repo}`, private: true, type: "module" };
  pkg.scripts ??= {};
  pkg.devDependencies ??= {};
  let changed = !existsSync(p);
  for (const [k, v] of Object.entries({ ...COMMON_PKG_SCRIPTS, ...role.pkgScripts })) {
    if (pkg.scripts[k] === undefined) {
      pkg.scripts[k] = v;
      changed = true;
    }
  }
  if (!pkg.devDependencies["@fission-ai/openspec"]) {
    pkg.devDependencies["@fission-ai/openspec"] = OPENSPEC_VERSION;
    changed = true;
  }
  pkg.engines ??= { node: ">=20" };
  if (changed) {
    writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`);
    report.push(["merged", "package.json"]);
  } else report.push(["kept", "package.json"]);
}

// .claude/settings.json — add the PostToolUse hook if absent.
{
  const p = join(target, ".claude", "settings.json");
  const s = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
  s.hooks ??= {};
  s.hooks.PostToolUse ??= [];
  const cmd = "node scripts/hooks-post-edit.mjs";
  const present = s.hooks.PostToolUse.some((h) => (h.hooks ?? []).some((x) => x.command === cmd));
  if (!present) {
    s.hooks.PostToolUse.push({ matcher: "Edit|Write", hooks: [{ type: "command", command: cmd }] });
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, `${JSON.stringify(s, null, 2)}\n`);
    report.push(["merged", ".claude/settings.json"]);
  } else report.push(["kept", ".claude/settings.json"]);
}

// AGENTS.md — upsert lessons inside the managed region (per-block).
{
  const p = join(target, "AGENTS.md");
  if (existsSync(p)) {
    let text = norm(readFileSync(p, "utf8"));
    const BEGIN = "<!-- BEGIN-FACTORY-LESSONS -->";
    const END = "<!-- END-FACTORY-LESSONS -->";
    if (!text.includes(BEGIN)) text += `\n${BEGIN}\n${END}\n`;
    const lessons = JSON.parse(readFileSync(join(FACTORY, "lessons", "index.json"), "utf8"));
    const added = [];
    for (const l of lessons) {
      if (text.includes(`BEGIN-LESSON-${l.id} `) || text.includes(`BEGIN-LESSON-${l.id}-->`) || text.includes(`BEGIN-LESSON-${l.id} -->`)) continue;
      const block = norm(readFileSync(join(FACTORY, "lessons", l.installPayload), "utf8")).trim();
      text = text.replace(END, `${block}\n${END}`);
      added.push(l.id);
    }
    writeFileSync(p, text);
    report.push([added.length ? `lessons+${added.length}` : "kept", "AGENTS.md (lessons)"]);
  } else report.push(["skipped (no AGENTS.md yet)", "AGENTS.md (lessons)"]);
}

// git hooks path
{
  const inRepo = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: target, encoding: "utf8" }).status === 0;
  if (inRepo) {
    spawnSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: target });
    report.push(["configured", "git core.hooksPath=.githooks"]);
  } else report.push(["skipped (not a git repo)", "git core.hooksPath"]);
}

const w = Math.max(...report.map((r) => r[0].length));
console.log(`\nDoučko factory install -> ${relative(process.cwd(), target) || "."} (repo: ${repo})\n`);
for (const [a, f] of report) console.log(`  ${a.padEnd(w)}  ${f}`);
console.log(`
Next:
  1. npm install                       (pins @fission-ai/openspec@${OPENSPEC_VERSION})
  2. node scripts/check-factory-integrity.mjs --init-lock --adaptation "doucko multi-repo harness (${repo})"
     (only at post-adaptation G0 or inside an approved "Refs: PD-x" improvement commit)
  3. node scripts/gate-status.mjs`);
