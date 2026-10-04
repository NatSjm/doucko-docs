# PD-14 / PD-15 — review evidence is written, and its bar can be met (proof)

Approved by the product owner in chat on 2026-10-04: PD-14 "Fix in factory",
PD-15 "Major bar + dispositions". Found while running the slice 1 review gates.

## PD-14 — red

The review gate's persist step was an agent with the default read-only tools. The
backend run `trace/workflow-runs/20261004-051324-review-gate.json` recorded it as
`ok: true`, and its own answer said:

> I couldn't write the file. This session only has read-only tools (Glob, Grep, Read)

No `review-findings.json` existed after any run.

## PD-14 — fix and green

`run-workflow.mjs` gives workflows `persist(relPath, data)`: a deterministic write
inside the repository that stamps `WORKFLOW_FILL_ISO_UTC` and is listed in the run
record (`persisted`). `review-gate.js` persists through it. Probe workflow (not dry):

```
  ✓ persist trace/pd14-probe.json
  "refused": "persist: ../outside-pd14.json is outside the repository"
workflow pd14-probe: ok — 0 step(s), 0 failed, $0.00
{ "stamped": "2026-10-04T05:49:09Z", "ok": true }
```

`eval-suite`, `trajectory-eval` and `vision-verify` still use writer agents; their
slices are not due yet. PD-14 lists them for conversion when first due.

## PD-15 — red

`check-trajectory` accepted only `clean: true`, i.e. zero confirmed findings in one
run. Slice 1 rounds: backend 8 major / 18 minor, then 3 / 19; frontend 11 / 16 in
round 2. Each round fixed confirms another 20+.

## PD-15 — fix and green

`review-findings.json` lists every confirmed or contested finding (`status: "open"`).
`reviewDisposition()` (factory-config) is the bar, used by `check-trajectory` and
by the process ratchet's `--release` guard:

```
clean   nothing confirmed (clean:true, no list)
UNCLEAN round-2 style, unclean, no list — no findings list to disposition
UNCLEAN open major — F01: major finding is open
UNCLEAN major waived — F01: a major finding cannot be waived in review evidence — fix it
UNCLEAN major fixed, unknown commit — F01: fixCommit deadbee is not a commit here
UNCLEAN minor waived, no reason — F02: waived without a reason
clean   all dispositioned
```

PLAYBOOK step f and GATES G6 now describe the dispositioning.
