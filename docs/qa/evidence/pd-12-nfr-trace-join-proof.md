# PD-12 — non-functional requirements join the trace chain (proof)

Approved by the product owner in chat on 2026-10-04 ("Fix in factory").
Found while verifying slice 1 (`platform-foundation`) in the backend.

## Red (backend, before the fix)

`mvnw verify` was green (27 unit, 2 integration tests), but `npm run qa:verify`
failed on the process ratchet:

```
FAIL  [dead-trace] dead-@trace alarm: 7 @trace annotation(s) exist in test files but 0 join the traceability chain (trace/trace.json) — the annotations are decorative, not evidence
Result: FAIL (1 failure(s))
```

`check-traceability.mjs` built `trace.json` `links` from MVP FR ids only, so
an `@trace NFR-x` could never join. Backend slice 1 traces only NFRs
(NFR-2/3/4/9/10/11/12). The frontend passed the same guard solely because of
a single `@trace FR-58`; its six NFR annotations were not joined either.
A second gap: the tracer parsed `@trace` ids as `[A-Z]+-\d+`, while the
ratchet counts categorized ids (`NFR-A11Y-02`), so those could never join.

## Fix

- `check-traceability.mjs`: MVP NFR/TC/BC requirements get `links` rows
  (`id`, `owners`, `ownedHere`, `tests`) and a report table
  "Other MVP requirements". FR spec/plan/recording checks are unchanged.
- `@trace` parsing uses the ratchet's grammar (categorized ids).
- `check-workspace.mjs` needs no change: it joins test counts for `FR-` ids
  only, so the extra rows are ignored there.

## Green (after `npm run factory:install` in all three repos)

| Repo | @trace ids joined in trace.json | process-ratchet dead-trace |
|---|---|---|
| backend | 0 → 7 (NFR-2, 3, 4, 9, 10, 11, 12) | FAIL → passes (ratchet now NOT-EARNED, pending baseline) |
| frontend | 1 → 7 (FR-58, NFR-3, 4, 6, 9, 12, 13) | PASS → PASS |
| docs | — | `check:workspace` Result: PASS |
