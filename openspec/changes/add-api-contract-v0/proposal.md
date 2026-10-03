# Proposal: add-api-contract-v0

- **Kind:** cross-repo contract change (docs store)
- **Affects:** `api/openapi.yaml` (new), backend (generated `kotlin-spring`
  interfaces), frontend (generated TS client). No product spec changes.
- **Status:** draft — review before archive; code repos pin it only after
  archive (AGENTS.md: contract changes flow outward).

## Why

NFR-12 makes the OpenAPI contract the single source of truth for both code
repos (TC-3, D-19). Phase 2 of the playbook drafts v0 next to the baseline
specs so Phase 3 can plan slices against real operations.

## What changes

`api/openapi.yaml` v0.3.0 (OpenAPI 3.0.3): 32 paths, 46 operations.

| Area | Operations | Spec |
|---|---|---|
| `/api/child/hq`, rank-up ack, missions, summary | HQ, pending rank-up acknowledgement, briefing, mission summary | practice-flow, gamification |
| `/api/child/missions/{id}/…` tasks | current task, task, attempts, hints, replay | practice-flow, answer-checking |
| `/api/child/missions/{id}/tasks/{id}/reports`, images | report a problem, task images | practice-flow |
| `/api/child/profile/settings` | get/patch settings (`GUIDED` → 422) | child-profile |
| `/api/admin/session` | sign in/out, session probe | admin-access |
| `/api/admin/sources`, tasks, missions, reference | CRUD, uploads, publish rules, bulk publish, answer tester, preview | content-authoring |
| `/api/admin/stats`, reports | weekly stats, flag queue, re-evaluate, dismiss | progress-stats |

Conventions fixed by v0:

- Child area has no authentication; admin area uses the `SESSION` cookie
  plus `X-XSRF-TOKEN` on data-changing calls (401 / 403).
- Errors are `application/problem+json` with `errors[]` (field validation)
  and `conflicts[]` (ids that block a state change, e.g. FR-57).
- An unparseable submission returns `200` with `status: UNPARSEABLE`, not an
  error: no attempt is used (FR-22).
- Rule-violating state changes (publish, delete, re-submit) return `409`.

## Decisions to review

1. The rank ladder and names are served by the backend (`Rank` in HQ), so the
   skin's ladder lives in backend configuration; the frontend skin keeps
   copy, art and colours.
2. Answer specs use one flat `AnswerSpec` with type-specific optional fields
   rather than a `oneOf` per type, to keep both generators simple. The
   backend validates the per-type combinations.
3. Mission runs are implicit: `current-task` resumes the latest run and
   `replay` starts a new one; there is no run id in the API.

## Revision v0.2 (2026-10-03)

An independent `contract-review` run (7 reviewers, one per spec; record
`trace/workflow-runs/20261003-053111-contract-review.json`) found 4 blocker,
26 major and 27 minor mismatches with the re-authored specs. All 57 were
applied. The notable shape changes:

- task locales are configuration, not an enum; `LocalizedText` carries
  `{ cs, secondary: { locale, text } | null }`;
- the report operation moved under `/api/child/missions/{missionId}/tasks/{taskId}`;
- `HqView.pendingRankUp` + `ackRankUp`, `MissionSummary.rankReachedDuringRun`,
  `AttemptResult.bonusXp` / `completedMissionIds` (rank-up plays once; OQ-28 bonuses);
- `LoggedAttempt.replay` and `.reevaluation` (original verdict kept);
- merge-patch semantics on `ProfileSettingsPatch`; sign-in never returns 400;
- a `csrfToken` security scheme on every admin mutation; 400/409/413 where
  the specs require them; field and count limits from the specs;
- `bulkPublishTasks` kept, now specified in content-authoring (decision OQ-32,
  from the PRD §9.3 UX direction): 1-100 tasks, a result per task;
- missions have a `position`, no title (CA-D17).

## Revision v0.3 (2026-10-03)

The independent review of v0.2 (record
`trace/workflow-runs/20261003-060056-contract-review.json`) found 0 blocker,
7 major and 24 minor mismatches. All of them were applied. The notable changes:

- `ReferenceData` gains `grades` and `subjects` (CA-D16 is configuration);
- one field-path convention for `Problem.errors[].field` (info, Conventions);
- authoring text limits are `x-maxCodePoints` (server-enforced, after
  trimming) instead of `maxLength`, so generated validators cannot refuse
  what the spec accepts;
- `updateSource` is now `PUT` with full replacement on a closed
  `SourceMetadataUpdate` (a `file` field is 400, multipart is 415);
- `getStats.weeks` and `listReports.status` are pattern-checked strings with
  no schema default, so `weeks=`, `٤` and `status=` are 400 as the specs require;
- `AttemptResult.rankUp` covers crossings from other missions' bonuses;
  documented UNPARSEABLE values; `locked`, `continueTarget`, `Feedback`
  fields and `taskPromptExcerpt` are required;
- choice option keys are `A`…`J` in display order; translated options are
  keyed `<part key>.<option key>`;
- 400 on both status operations and on preview; mission field rules are 400
  and state rules 409.

Spec follow-ups in the same revision: practice-flow says per-part verdicts
travel in `AttemptResult.parts`, not in `feedback`. content-authoring lets
CHOICE_SINGLE carry several correct options, as FR-20 says, which resolves
the round-3 cross-check contradiction
(`trace/workflow-runs/20261003-060054-spec-crosscheck.json`). Its "file cannot
be replaced" scenario accepts 400, 405 or 415.

## Validation

- Structural check (YAML parses, every `$ref` resolves, unique operationIds,
  admin ops secured with CSRF on mutations, child ops open): pass (v0.3).
- Independent review against the specs: v0.1 and v0.2 reviewed, findings
  applied in v0.2 and v0.3 respectively.
- Not yet run: an OpenAPI linter and the two generators. Phase 4a runs the
  backend `openapi-generator-maven-plugin` and the frontend client generator
  against the pinned file.
