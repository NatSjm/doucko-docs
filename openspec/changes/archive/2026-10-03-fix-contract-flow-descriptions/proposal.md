# Proposal: fix-contract-flow-descriptions

- **Kind:** cross-repo contract fix (docs store)
- **Affects:** `api/openapi.yaml` 0.5.0 → 0.5.1. No product spec changes.

## Why

When the backend first ran its `openapi-generator` against the pinned
contract (Phase 3, D-P2), spec validation failed:

```
-attribute components.schemas.SourceUpload.at most 50 MB is unexpected
-attribute components.schemas.MissionCard.CA-D17) is unexpected
-attribute components.schemas.WeekStats.Europe/Prague is unexpected
```

Each comes from an unquoted `description:` inside a YAML flow mapping
(`{ … }`) that contains a comma. YAML ends the value at the comma, and the
rest becomes a stray schema key. This is the same class as the
`exactDecimals` defect fixed in v0.3.

## What changes

The three descriptions are quoted. A scan of every schema, parameter, request
body and response schema for keys that are not OpenAPI 3.0 keywords (or
`x-` extensions) now finds none.

## Validation

- `openapi-generator` (backend, `mvnw compile`) generates from the fixed
  file.
- Frontend `api:generate` + `typecheck` pass.
