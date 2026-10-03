# PD-13 — typed workflow steps return structured output (proof)

Approved by the product owner in chat on 2026-10-04 ("Inline agent
definition"). Found while running the slice 1 review gates.

## Red (before the fix)

Every review-gate run failed the three typed reviewers; only the untyped
`find:visual` step succeeded:

```
✗ find:correctness 152s $0.590 — result did not contain JSON for the requested schema
✗ find:spec-compliance 155s $0.635 — result did not contain JSON for the requested schema
✗ find:security 156s $0.770 — result did not contain JSON for the requested schema
workflow review-gate: FAILED — 4 step(s), 3 failed, $2.11
```

(backend `trace/workflow-runs/20261003-232403-review-gate.json`; the frontend
runs failed the same way.) Isolated repro with the runner's exact flags:

```
claude -p --output-format json ... --agent code-reviewer --json-schema '{findings: [...]}'
subtype success · turns 7 · structured_output: undefined · result: markdown findings
```

With `--agent`, the CLI ignores `--json-schema`; the agent answers in the
prose format of its own "Output contract".

## Fix

`run-workflow.mjs`: a typed step **with** a schema no longer passes
`--agent`. It reads `.claude/agents/<type>.md`, passes the body via
`--append-system-prompt` (plus one line asking for delivery through the
structured output) and the frontmatter `tools:` via `--tools`. Typed steps
without a schema still use `--agent`.

## Green

Same repro, inlined the way the runner now does it:

```
tools Read,Grep,Glob,Bash | subtype success turns 5 cost 0.19
structured_output findings: 2
```

Full review-gate runs over both slice 1 changes follow in the slice evidence.
