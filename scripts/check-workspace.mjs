// Doučko factory — cross-repo join (docs repo only). NEW: no upstream equivalent.
//
// Upstream Project Factory proves the requirement chain inside one repo. With
// three repos, each code repo proves only what the capability plan assigns to
// it, so something must prove that NOTHING FALLS BETWEEN THE REPOS. This check
// runs in the docs repo (the store) and joins:
//
//   docs/requirements.md (tags) × docs/mvp-capability-plan.md (Repo(s) column)
//     × <member>/factory.config.json (acceptanceMethods each repo proves)
//     × <member>/trace/trace.json (committed @trace test links)
//     × <member>/trace/acceptance-contracts.json (committed acceptance join)
//     × <member>/contract submodule pin vs this repo's HEAD
//
// Findings:
//   orphan-method   an MVP (id, method) whose owner repos prove none of that
//                   method — a phantom acceptance method across repos  -> FAIL
//   unowned         an MVP FR/NFR with no Repo(s) owner in the plan      -> FAIL
//   test-trace      an owner repo has no "@trace <id>" test for an owned FR
//                   -> WARN (FAIL with --strict-tests / --release)
//   member          a workspace member checkout is missing              -> WARN
//                   (FAIL with --release: the release join needs every repo)
//   contract-pin    a member's contract/ submodule is absent or pinned to
//                   a commit other than this repo's HEAD                 -> WARN
//
// Three-valued: before the plan exists -> "Result: SKIP-pending" (visible,
// never PASS). Members' trace files are the COMMITTED evidence of each repo —
// regenerate them there (pre-commit does) before relying on this join.
//
// Usage (from the docs repo root):
//   node scripts/check-workspace.mjs [--strict-tests] [--release] [--check-fresh]
// Outputs: docs/qa/workspace-traceability-report.md, trace/workspace.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { loadConfig, parseOwnership } from "./lib/factory-config.mjs";

const root = process.cwd();
const flags = new Set(process.argv.slice(2));
const CFG = loadConfig(root);
const REPORT = "docs/qa/workspace-traceability-report.md";
const JSON_OUT = "trace/workspace.json";

const failures = [];
const warnings = [];
const fail = (check, msg) => failures.push({ check, msg });
const warn = (check, msg) => warnings.push({ check, msg });
const gated = (on, check, msg) => (on ? fail(check, msg) : warn(check, msg));
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
const readJson = (p) => {
  const t = read(p);
  if (t === null) return null;
  try {
    return JSON.parse(t);
  } catch {
    return undefined;
  }
};
const git = (cwd, args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};

if (CFG.repo !== "docs") {
  console.error("check-workspace runs in the docs repo only (factory.config.json repo = docs).");
  console.log("Result: FAIL");
  process.exit(1);
}

// ---------- 1. contract: tagged MVP requirements + ownership ----------
const VOCAB = ["local-verifiable", "vision-verify", "recording", "e2e", "a11y", "eval", "deploy-gated", "pixel-diff"];
const reqText = read(join(root, CFG.paths.requirements));
const planText = read(join(root, CFG.paths.plan));
const reqs = new Map(); // id -> { methods:Set }
for (const line of (reqText ?? "").split("\n")) {
  const m = line.match(/^\|\s*((?:FR|NFR)-(?:[A-Z0-9]+-)?\d+)\s*\|/);
  if (!m || /\|\s*Future\s*\|/i.test(line)) continue;
  const cells = line.split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, ""));
  const toks = (cells.at(-1) ?? "").toLowerCase().split(/[\s,;/+]+/).filter(Boolean);
  const methods = toks.length && toks.every((t) => VOCAB.includes(t)) ? new Set(toks) : new Set();
  reqs.set(m[1], { methods });
}

if (reqText === null || planText === null) {
  const missing = [reqText === null && CFG.paths.requirements, planText === null && CFG.paths.plan].filter(Boolean).join(" and ");
  console.log(`Scope: 0 requirement(s)`);
  if (flags.has("--release")) {
    console.error(`FAIL  [contract] ${missing} not found — the release join needs requirements AND the capability plan`);
    console.log("Result: FAIL");
    process.exit(1);
  }
  console.log(`SKIP-pending [contract] ${missing} not found — the cross-repo join starts at G3 (pending, NOT a pass)`);
  console.log("Result: SKIP-pending");
  process.exit(0);
}
const owners = parseOwnership(planText);

// ---------- 2. members ----------
const members = {}; // repo -> { path, present, methods, trace, contracts, pin }
const docsHead = git(root, ["rev-parse", "HEAD"]);
for (const [repo, rel] of Object.entries(CFG.workspace?.members ?? {})) {
  const abs = join(root, rel);
  const present = existsSync(join(abs, "factory.config.json"));
  const info = { path: rel, present, methods: [], traceLinks: null, acceptance: null, pin: null };
  members[repo] = info;
  if (!present) {
    gated(flags.has("--release"), "member", `${repo}: no checkout with factory.config.json at ${rel} — its evidence cannot be joined`);
    continue;
  }
  const mcfg = readJson(join(abs, "factory.config.json")) ?? {};
  info.methods = Array.isArray(mcfg.acceptanceMethods) ? mcfg.acceptanceMethods : VOCAB;
  const trace = readJson(join(abs, "trace", "trace.json"));
  if (trace === undefined) warn("member", `${repo}: trace/trace.json is not valid JSON`);
  info.traceLinks = trace ? new Map((trace.links ?? []).map((l) => [l.id, l.tests ?? []])) : null;
  if (!trace) warn("member", `${repo}: trace/trace.json not found — run node scripts/check-traceability.mjs there and commit it`);
  const acc = readJson(join(abs, "trace", "acceptance-contracts.json"));
  info.acceptance = acc?.contracts ?? null;
  // contract pin: gitlink SHA of the submodule vs the docs HEAD
  const sub = mcfg.contract?.submodule;
  if (sub) {
    const ls = git(abs, ["ls-tree", "HEAD", sub]);
    const sha = ls?.match(/^160000 commit ([0-9a-f]{40})/)?.[1] ?? null;
    info.pin = sha;
    if (!sha) warn("contract-pin", `${repo}: no committed ${sub}/ submodule — the contract is unpinned (git submodule add <docs-remote> ${sub})`);
    else if (docsHead && sha !== docsHead) warn("contract-pin", `${repo}: ${sub}/ is pinned to ${sha.slice(0, 8)}, docs HEAD is ${docsHead.slice(0, 8)} — bump the pin when the contract change is meant to land there`);
  }
}

// ---------- 3. the join ----------
const rows = [];
for (const [id, { methods }] of reqs) {
  const own = [...(owners.get(id) ?? [])].sort();
  if (own.length === 0) fail("unowned", `${id} has no Repo(s) owner in ${CFG.paths.plan}`);
  const byMethod = {};
  for (const method of [...methods].sort()) {
    const provers = own.filter((r) => r !== "docs" && (members[r]?.methods ?? []).includes(method));
    byMethod[method] = provers;
    if (own.length && provers.length === 0)
      fail("orphan-method", `${id} declares ${method}, but none of its owner repo(s) [${own.join(", ")}] proves ${method} (factory.config.json acceptanceMethods) — a phantom method between repos`);
  }
  const tests = {};
  if (/^FR-/.test(id)) {
    for (const r of own.filter((x) => x !== "docs")) {
      const m = members[r];
      if (!m?.present || !m.traceLinks) continue;
      const t = m.traceLinks.get(id) ?? [];
      tests[r] = t.length;
      if (t.length === 0) gated(flags.has("--strict-tests") || flags.has("--release"), "test-trace", `${id}: owner ${r} has no test annotated "@trace ${id}"`);
    }
  }
  rows.push({ id, owners: own, methods: byMethod, tests });
}

// ---------- outputs (deterministic, ASCII, no timestamps) ----------
const memberRows = Object.entries(members)
  .map(([r, m]) => `| ${r} | ${m.path} | ${m.present ? "yes" : "**no**"} | ${m.methods.join(", ") || "-"} | ${m.pin ? m.pin.slice(0, 8) : "-"} |`)
  .join("\n");
const report = `# Workspace Traceability Report (generated - do not hand-edit)

Generated by \`node scripts/check-workspace.mjs\` in the docs repo. Joins the
contract (requirements + plan ownership) with every member repo's committed
evidence (trace/trace.json, factory.config.json acceptanceMethods).

Scope: ${rows.length} MVP requirement(s).
Result: ${failures.length === 0 ? "PASS" : `FAIL (${failures.length} failure${failures.length === 1 ? "" : "s"})`}${warnings.length ? `, ${warnings.length} warning(s)` : ""}

## Members

| Repo | Path | Present | Proves methods | Contract pin |
|---|---|---|---|---|
${memberRows}

## Requirements

| Req | Owner repo(s) | Methods -> proving repo(s) | @trace tests per owner |
|---|---|---|---|
${rows
  .map(
    (r) =>
      `| ${r.id} | ${r.owners.join(", ") || "**none**"} | ${Object.entries(r.methods).map(([m, p]) => `${m} -> ${p.join("+") || "**NONE**"}`).join("; ") || "-"} | ${Object.entries(r.tests).map(([k, v]) => `${k}: ${v || "**0**"}`).join(", ") || "-"} |`,
  )
  .join("\n")}

## Failures

${failures.length ? failures.map((f) => `- **${f.check}**: ${f.msg}`).join("\n") : "None."}

## Warnings

${warnings.length ? warnings.map((w) => `- **${w.check}**: ${w.msg}`).join("\n") : "None."}
`;

if (flags.has("--check-fresh")) {
  const committed = read(join(root, REPORT));
  if (committed === null) fail("freshness", `${REPORT} does not exist — run the check and commit it`);
  else if (committed.replace(/\r\n/g, "\n") !== report) fail("freshness", `${REPORT} is stale — regenerate and commit`);
} else {
  mkdirSync(join(root, "docs", "qa"), { recursive: true });
  mkdirSync(join(root, "trace"), { recursive: true });
  writeFileSync(join(root, REPORT), report);
  writeFileSync(join(root, JSON_OUT), `${JSON.stringify({ generatedBy: "scripts/check-workspace.mjs", rows, failures, warnings }, null, 2)}\n`);
}

for (const w of warnings) console.warn(`WARN  [${w.check}] ${w.msg}`);
for (const f of failures) console.error(`FAIL  [${f.check}] ${f.msg}`);
console.log(`\nScope: ${rows.length} MVP requirement(s) across ${Object.keys(members).length} member repo(s)`);
if (!flags.has("--check-fresh")) console.log(`wrote ${REPORT} and ${JSON_OUT}`);
console.log(`Result: ${failures.length ? "FAIL" : "PASS"}${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
process.exit(failures.length ? 1 : 0);
