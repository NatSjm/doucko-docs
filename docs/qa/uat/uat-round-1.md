# UAT round 1 — intake (Phase 8)

Raw observations from the owner's own use of the app on the laptop stack. Each item is triaged
later with the `uat-triage` workflow (`{ bugs: [{ id, area, text, steps }] }`), which maps it to
requirements and code. No child data or workbook content here (NFR-3, NFR-4).

| Id | Date | Area | Reported by | Observation | Status |
|---|---|---|---|---|---|
| UAT-1 | 2026-10-11 | Admin authoring | Owner | Publishing is hard to find: "I always have to look for where it is." The publish action sits in a separate panel below the editor form and is disabled until the form is saved, on both the task editor and the mission editor. Related: a published mission refuses a draft task only when Save is clicked, with no earlier hint in the picker. | new |
