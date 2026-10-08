# Demo Script — MVP walkthrough

Written 2026-10-08 (Europe/Prague). It follows the recorded clips in `../frontend/docs/qa/demo-recordings/`. Each manifest lists the requirement ids its clips prove. The clips are the evidence; this script is the order to show them in.

The recordings use self-authored content and a placeholder child profile only (NFR-3, NFR-4).

| # | Story beat | Clip(s) | Proves | Current vision verdict? |
|---|---|---|---|---|
| 1 | Admin uploads a source PDF | `phase6-admin-theme/rec-source-upload` | FR-1 | no (superseded, not re-judged) |
| 2 | Task editor beside the PDF; fast single-part entry | `phase6-admin-theme/rec-pdf-beside-editor`, `nfr8-task-entry/nfr8-single-part-task-entry` | FR-2, FR-3, NFR-8 | the nfr8 clip only |
| 3 | Images, parts, hints, translations; preview and tester | `rec-task-images`, `rec-parts-hints-translations`, `rec-preview-tester` | FR-4, FR-6..8, FR-10 | no |
| 4 | Task list and provenance | `rec-task-list-provenance` | FR-11, FR-13 | no |
| 5 | Missions: create, reorder, publish, refusals | `slice6-authoring-missions/*` (5 clips) | FR-9, FR-55 | yes |
| 6 | Child: HQ to a task in 2 clicks, correct / wrong / reveal, unparseable input | `slice7-practice-flow/slice7-hq-missions`, `slice7-start-two-clicks`, `slice7-correct-next`, `slice7-wrong-then-reveal`, `slice7-unparseable` | FR-22, FR-24..27, NFR-7 | yes |
| 7 | Hints, translation, report, save and resume | `slice7-hints-translation`, `slice7-report`, `slice7-save-resume` | FR-28..31 | yes |
| 8 | XP, rank-up (incl. reduced motion), mission complete, replay | `slice8-gamification/*` (8 clips) | FR-32, FR-36, FR-37, NFR-13 | yes |
| 9 | HQ skin; light and dark themes | `rec-skin-hq`, `rec-theme-light`, `rec-theme-dark` | FR-39, FR-58 | no |
| 10 | Admin stats and the flag queue (fix + re-evaluate) | `rec-stats`, `rec-flag-queue` | FR-40, FR-41 | no |

Clip validity (file exists, size, screenshot, flow asserted): `../frontend/docs/qa/recordings-report.md` (33/33 PASS). Vision verdicts: `../frontend/docs/qa/vision-report.md`. Beats 1–4, 9 and 10 should be shown with the caveat that their stills have not been re-judged since they were re-recorded.
