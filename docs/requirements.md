# Requirements Document

**Doučko — a home math tutor for a Czech 6th-grader**

*Prepared for spec-driven delivery. Split from `docs/prd.md` (Draft v0.2) in
Phase 1. The business narrative is in `docs/product-brief.md`.*

| | |
|---|---|
| **Status** | Scope signed off at checkpoint 1 (2026-10-02) — record in `docs/qa/checkpoint-1-scope-signoff.md`; decisions in §6 |
| **Source** | `docs/prd.md` v0.2 (2026-09-28) |
| **Id policy** | Every FR/NFR/TC/BC/OQ id is carried over from the PRD unchanged. Ids are never renumbered; new ones are appended. Rows added or amended at checkpoint 1 are marked *(CP1)*. |

## 1 Business Overview

Doučko is a private home math tutor for one child, a grade-6 pupil at a Czech
primary school (ZŠ). Today she practices on paper from the workbook the class
uses. A parent has to check every answer, feedback comes late, and the
Ukrainian-speaking father finds it hard to help with Czech task text.

The platform lets the parent (admin) type tasks from a workbook PDF into a
web form, with the PDF open next to it. The child then solves those tasks on
a laptop and gets an instant, deterministic answer check: 2 attempts, then
the answer is revealed. Optional hints and a Ukrainian translation are
available. Progress is a hero-academy game with missions, XP and ranks.

**MVP:** deterministic checking only, one hardcoded child profile, a
password-protected admin, Czech UI with `uk` task text, and Docker Compose on
the home laptop. **Future:** AI explanations and a Guided (Socratic) mode,
AI-assisted content, child accounts, graphic answers, and more grades,
subjects and locales. The architecture leaves seams for these (FR-43, FR-44)
so they add code rather than force rewrites.

## 2 Functional Requirements (FR)

Requirements are grouped by functional area. 'Phase' indicates MVP or Future.

Every FR and NFR row carries a **Verification** tag in its last column: the
declared, executable acceptance method. Closed vocabulary (comma-separate to
combine):

| Tag | Meaning |
|---|---|
| `local-verifiable` | a repo script/test proves it deterministically (unit/integration test, policy check) |
| `vision-verify` | a fresh agent inspects the settled rendered result |
| `recording` | an asserted demo clip covers the behavior |
| `e2e` | end-to-end browser test (Playwright against the compose stack) |
| `a11y` | axe accessibility gate (light + dark) |
| `eval` | graded rubric eval under `evals/cases/` |
| `deploy-gated` | only provable against the deployed target |

`check-acceptance-methods` enforces the declaration: at **G3 (existence
mode)** every declared tag must resolve to a real, non-stub mechanism in an
owner repo; from **G4 on (artifact mode)** it must resolve to a fresh,
threshold-passing evidence artifact.

### 2.1 Content management (admin)

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-1 | MVP | Content | Admin uploads a PDF **source** with metadata: title, publisher, edition, grade, and subject. *(§6.6 OQ-31: publisher and edition are optional.)* | local-verifiable, e2e |
| FR-2 | MVP | Content | Admin views an uploaded PDF page by page, side by side with the task editor, and can jump to a page number. | e2e |
| FR-3 | MVP | Content | Admin creates a task with: Czech prompt text, topic, grade, difficulty (1–3), and **source reference** (source, page, task number, optional sub-part). | e2e |
| FR-4 | MVP | Content | Admin attaches 0..n images (PNG/JPG, cropped outside the app) to a task. Images are shown to the child with the task. | e2e |
| FR-5 | MVP | Content | Every task has an **answer modality**: `TEXT` or `GRAPHIC`. `GRAPHIC` tasks are never served to the child in MVP. | local-verifiable |
| FR-6 | MVP | Content | A task has 1..n **answer parts** (e.g. a, b, c). Each part has a label and its own answer spec (see §2.2). *(§6.6 CA-D13: a GRAPHIC task may have zero parts.)* | local-verifiable |
| FR-7 | MVP | Content | Admin adds 0..n ordered hints per task. Tasks without hints work normally. | local-verifiable |
| FR-8 | MVP | Content | Admin adds translations of prompt, part labels, and hints per locale (`uk` in MVP). Supported locales are configuration, not code. | local-verifiable |
| FR-9 | MVP | Content | Admin creates **missions**: ordered lists of tasks within one topic. The default size is 10 tasks. | e2e |
| FR-10 | MVP | Content | Admin previews a task exactly as the child sees it, and can type test answers to see the checker's verdict and normalized interpretation ("answer tester"). | e2e |
| FR-11 | MVP | Content | Admin filters and searches tasks by grade, topic, source, page, modality, and status. | e2e |
| FR-12 | MVP | Content | Tasks have status `DRAFT` or `PUBLISHED`. Only published tasks in published missions are served to the child. | local-verifiable |
| FR-13 | MVP | Content | Given any task, admin can see where it came from (source title, edition, page, task number) and open the PDF at that page. | e2e |
| FR-55 | MVP | Content | *(CP1, OQ-18)* Admin edits existing sources, tasks (every field, including answer specs, hints, translations and images) and missions. *(§6.6 CA-D3: a source's PDF file cannot be replaced.)* | e2e |
| FR-56 | MVP | Content | *(CP1, OQ-18)* Admin can delete a source, task or mission only when no attempt references it (directly or through its tasks); otherwise the delete is refused and the admin can unpublish instead. *(§6.6 CA-D4: a source referenced by any task cannot be deleted.)* | local-verifiable |
| FR-57 | MVP | Content | *(CP1, OQ-19)* A mission can be published only when every task in it is `PUBLISHED` with modality `TEXT`. A task in a published mission cannot return to `DRAFT` until that mission is unpublished. | local-verifiable |

### 2.2 Answer checking (deterministic checker)

The checker is a pure, side-effect-free domain module. Given an answer spec
and raw input, it returns a per-part verdict (`CORRECT` / `WRONG` /
`UNPARSEABLE`) and the normalized interpretation of the input.

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-14 | MVP | Checking | **Integers:** leading and trailing whitespace, a leading `+`, and thousands separators (space, NBSP, thin space) are ignored. `1 000` = `1000`. | local-verifiable |
| FR-15 | MVP | Checking | **Decimals:** comma and dot are equivalent, and equality is numeric (`0,50` = `0,5` = `.5`), unless the part requires exact form (e.g. "round to 2 decimal places" → `0,50` is required). | local-verifiable |
| FR-16 | MVP | Checking | **Fractions:** `a/b` input is accepted. If the part allows it, equivalent forms count (`1/2` = `0,5` = `2/4`). A per-part flag `requireLowestTerms` rejects `2/4` when `1/2` is expected. Mixed numbers (`1 1/2`) are parsed. | local-verifiable |
| FR-17 | MVP | Checking | **Numbers with units:** the unit is normalized (`cm2` = `cm²` = `cm^2`; spacing ignored). A per-part flag sets whether the unit is required. **No unit conversion**: the answer must be in the unit the task asks for. | local-verifiable |
| FR-18 | MVP | Checking | **Multiple choice:** single- and multi-select. Multi-select is correct only when the set matches exactly. | local-verifiable |
| FR-19 | MVP | Checking | **Short text** (e.g. "tajenka" puzzles): case-insensitive and whitespace-trimmed. Diacritics-insensitive by default, with a per-part option to be strict. | local-verifiable |
| FR-20 | MVP | Checking | A part can list several accepted alternatives. | local-verifiable |
| FR-21 | MVP | Checking | An optional numeric tolerance can be set per part (default: exact). | local-verifiable |
| FR-22 | MVP | Checking | `UNPARSEABLE` input (e.g. `5,,2`) gets a friendly format message and **does not consume an attempt**. | local-verifiable, e2e |
| FR-23 | MVP | Checking | The checker is covered by a golden table of ≥ 150 input → verdict cases, versioned in the backend repo. | local-verifiable |

### 2.3 Practice flow (child)

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-24 | MVP | Practice | The child opens the app with no login and lands on **HQ** (home) as the single hardcoded profile. | e2e |
| FR-25 | MVP | Practice | HQ lists available missions grouped by topic, each with progress (x/10 solved) and state (new / in progress / complete). | e2e |
| FR-26 | MVP | Practice | The task screen shows the prompt, images, and one input per answer part. The child submits all parts together. | e2e |
| FR-27 | MVP | Practice | **Attempts:** each task allows 2 attempts. After a wrong attempt, the child sees which parts are wrong, but not the correct values. After the 2nd wrong attempt, the correct answer for every part is **revealed** and the task is marked `REVEALED`. | local-verifiable, e2e |
| FR-28 | MVP | Practice | **Hints:** if the task has hints, the child can open them one at a time, in order, at any point. Each hint used is recorded. | e2e |
| FR-29 | MVP | Practice | **Translation toggle:** if a `uk` translation exists, the child can show it next to the Czech text ("Zobrazit ukrajinsky"). The UI stays Czech. The toggle state is remembered per profile. | e2e |
| FR-30 | MVP | Practice | **Report a problem:** from any task, the child can flag it with a reason ("Myslím, že moje odpověď je správně" / "Zadání je nejasné" / other + note). The raw attempt is attached. | e2e |
| FR-31 | MVP | Practice | Every attempt is saved immediately. Closing the browser mid-mission resumes at the first unfinished task. | e2e |
| FR-32 | MVP | Practice | A mission-complete screen shows XP earned, first-try count, and any rank-up. | e2e, recording |
| FR-33 | MVP | Practice | Completed missions can be replayed. XP is awarded only for the first resolution of each task. | local-verifiable |

### 2.4 Gamification

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-34 | MVP | Game | **XP** per task, first resolution only: correct on 1st attempt = 10, correct on 2nd = 5, revealed = 1 (effort still counts). Each hint used costs 2, with a minimum of 1. All values are configuration. | local-verifiable |
| FR-35 | MVP | Game | Mission completion bonus: +20 XP (configurable). | local-verifiable |
| FR-36 | MVP | Game | **Ranks:** an ordered list of rank names with XP thresholds, defined in the theme configuration. Rank-up triggers a celebration animation. | local-verifiable, vision-verify |
| FR-37 | MVP | Game | HQ shows the current rank, an XP bar to the next rank, and total solved tasks. | e2e, vision-verify |
| FR-38 | MVP | Game | No negative mechanics: XP is never lost, and there are no timers, streak penalties, or leaderboards. | local-verifiable |
| FR-39 | MVP | Game | The theme (names, ranks, copy, illustrations, colors) is one swappable **skin**. See `docs/prd.md` §9 for the direction. | local-verifiable |
| FR-58 | MVP | Game | *(CP1, OQ-25)* The app follows the OS `prefers-color-scheme` setting with a dark and a light theme; there is no in-app toggle in MVP. | a11y, e2e |

### 2.5 Progress and stats (admin/parent)

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-40 | MVP | Stats | The admin stats page shows sessions per week, tasks per session, first-try rate per topic, hint usage, and revealed tasks. This directly measures the success metric (product brief §5). | e2e |
| FR-41 | MVP | Stats | The admin flag queue lists child reports with the task, raw input, and checker verdict. Admin can fix the answer spec and **re-evaluate** the attempt (awarding the missing XP) or dismiss the report. | e2e |
| FR-42 | MVP | Stats | The attempt log stores raw input, normalized input, per-part verdicts, hints used, and a timestamp. | local-verifiable |

### 2.6 Settings and forward-compatibility hooks

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-43 | MVP | Settings | The child profile stores settings: `secondaryTaskLocale` (`uk` or none) and `answerMode` (`DIRECT` only in MVP; `GUIDED` exists in the enum and API but is disabled). | local-verifiable |
| FR-44 | MVP | Settings | Feedback after an attempt is produced through a `TutorPort` abstraction. The MVP implementation returns deterministic feedback (verdict, hint pointer, reveal). | local-verifiable |

### 2.7 Future phase (recorded now, not built)

| ID | Phase | Area | Description | Verification |
|---|---|---|---|---|
| FR-45 | Future | AI | After a wrong answer, an AI explanation (OpenAI, backend-only) explains the likely mistake without solving the task outright on the 1st attempt. | eval |
| FR-46 | Future | AI | **Guided mode:** a Socratic dialogue that leads to the answer step by step. The tutor never states the final answer unless the child explicitly gives up. | eval |
| FR-47 | Future | AI | AI-drafted hints and translations enter as `DRAFT` and require admin review before publishing. | eval, e2e |
| FR-48 | Future | AI | PDF → draft task extraction (vision/RAG) with admin review. | eval |
| FR-49 | Future | AI | Explain the underlying topic material on request ("Vysvětli mi to"). | eval |
| FR-50 | Future | Users | Child login, multiple children per family, and parent accounts. | e2e |
| FR-51 | Future | Checking | Graphic answers (constructions, drawing) via a canvas or AI vision check. | eval |
| FR-52 | Future | Content | In-app cropping of task images from the PDF. | e2e |
| FR-53 | Future | Practice | Review missions built from previously failed or revealed tasks (spaced repetition). | local-verifiable |
| FR-54 | Future | Content | More grades and subjects; `ru` and other task locales. | local-verifiable |

> Rules: ids assigned once, never renumbered. Verification tags come only
> from the closed vocabulary above. Future rows are recorded for the seams
> they imply (FR-43, FR-44, NFR-14) and are not planned or built in MVP.

## 3 Non-Functional Requirements (NFR)

| ID | Phase | Category | Description | Verification |
|---|---|---|---|---|
| NFR-1 | MVP | Security | Admin UI and admin API require authentication (Spring Security; single admin user, password from env, stored as bcrypt). Child endpoints cannot mutate content. | local-verifiable |
| NFR-2 | MVP | Security | In MVP, the stack binds to localhost/LAN only. Nothing is exposed to the internet. | local-verifiable |
| NFR-3 | MVP | Privacy | The child's real name, photos, or any PII never appear in any repository, fixture, log, screenshot, or demo recording. The profile display name exists only in the local DB. | local-verifiable |
| NFR-4 | MVP | Legal | Copyrighted workbook content (Hravá matematika text, images, and answer keys) is **never committed** to any repository. Test fixtures use self-authored tasks. | local-verifiable |
| NFR-5 | MVP | Performance | Answer check round-trip is < 300 ms p95 on the laptop. Task screen loads in < 1.5 s. | local-verifiable, e2e |
| NFR-6 | MVP | Compatibility | Current Chrome, Edge, and Firefox on a laptop, ≥ 1280×720. Mobile is not required. | e2e |
| NFR-7 | MVP | Usability | The child can start or continue a mission within 2 clicks from HQ. The task screen is fully keyboard-operable (Enter submits). | e2e |
| NFR-8 | MVP | Usability | Admin can enter a typical single-part task in ≤ 60 s (keyboard-first form, sticky source and page fields). *(CP1, OQ-27: verification retagged from `eval` to `recording`, a timed clip of entering a typical single-part task.)* | recording |
| NFR-9 | MVP | Localization | All UI strings are externalized. The child UI is Czech; the admin UI is English (OQ-6). Adding a task locale needs configuration and data only. | local-verifiable |
| NFR-10 | MVP | Reliability | Postgres data lives in a Docker volume. A documented, cross-platform backup command (`npm run backup`, running pg_dump through `docker compose exec`) exists and works on Windows. Progress survives container restarts. *(CP1, OQ-26: was "`make backup`"; `make` is not standard on Windows.)* | local-verifiable |
| NFR-11 | MVP | Maintainability | The backend is a modular monolith. Module boundaries are verified by tests (Spring Modulith verify or ArchUnit). | local-verifiable |
| NFR-12 | MVP | API | The OpenAPI contract is the single source of truth. Generated code is never hand-edited, and a build fails if the implementation drifts from the contract. | local-verifiable |
| NFR-13 | MVP | Accessibility | WCAG AA contrast. Animations respect `prefers-reduced-motion`. | a11y |
| NFR-14 | Future | AI | OpenAI calls are made from the backend only. The key is never exposed to the frontend. There is a monthly budget cap, and prompts contain no PII. Prompts and responses are logged for review. | local-verifiable |
| NFR-15 | MVP | Security | *(CP1, OQ-23)* Admin uses form login with a session cookie that is HttpOnly and SameSite=Strict, CSRF protection is on for admin mutations, and the session expires after 8 h of inactivity. No lockout (LAN only, NFR-2). | local-verifiable |
| NFR-16 | MVP | Security | *(CP1, OQ-23)* The admin password supplied by env must be at least 12 characters; the backend refuses to start otherwise, with a clear message. *(§6.6 OQ-30: at most 72 bytes.)* | local-verifiable |
| NFR-17 | MVP | Reliability | *(CP1, OQ-24)* Uploads are limited to PDF ≤ 50 MB for sources and PNG/JPG ≤ 5 MB per image; anything else is rejected with a clear message. Files are stored on the local storage volume, never in a repository. | local-verifiable |

> The PRD's NFR table had no Phase column; it is added here so the gate
> scripts can tell MVP from Future rows. NFR-14 was categorized "AI (Future)"
> in the PRD and is now Phase `Future`, category `AI`. At checkpoint 1,
> NFR-8 and NFR-10 were amended and NFR-15..NFR-17 appended (marked *(CP1)*).

## 4 Constraints

### 4.1 Technical Constraints

| ID | Description |
|---|---|
| TC-1 | Backend: Kotlin, Spring Boot 4.x (amended from 3.x by ADR-0003), JVM 21, Maven (with wrapper `mvnw`), Postgres 16, Flyway. |
| TC-2 | Frontend: React, Vite, TypeScript (strict). |
| TC-3 | OpenAPI 3.x contract in the docs repo. Server interfaces and TS client are generated from it. |
| TC-4 | Three repositories: docs, backend, frontend. The contract is consumed via a pinned git submodule. |
| TC-5 | MVP runs via Docker Compose on the home laptop. No cloud, no running cost. |
| TC-6 | No AI/LLM calls in MVP. Future AI goes through the OpenAI API, called from the backend only. |
| TC-7 | SDD tooling: OpenSpec, with Stores/references (beta) across the 3 repos. Project Factory is optional and used partially: its requirements format (this PRD), `AGENTS.md` template, reviewer agent, and hooks. If full Factory gates are adopted, the stack swap (Maven/Kotlin, Vite instead of Next.js) is recorded as an ADR, and gates are mapped to `./mvnw verify` and `npm run check`. |
| TC-8 | Out of scope for MVP: graphic answers, automatic PDF extraction, child authentication, mobile layouts. |

> TC-7 status: the adapted Factory harness was adopted across all three repos
> by ADR-0002 (multi-repo store + harness). This resolves PRD OQ-10.

### 4.2 Business Constraints

| ID | Description |
|---|---|
| BC-1 | MVP is delivered in 1 week by a solo developer with AI agents. |
| BC-2 | Single user (the author's child), private use only. Workbook content is typed from a purchased copy for private use. Any public launch requires a license from the publisher (TAKTIK International) or fully self-authored content. |
| BC-3 | The project is also a course capstone (fwdays Agentic Engineering). Each practice used must be evidenced per the capstone `RUBRIC.md`: rules, loops, verification, maker ≠ checker, and specs committed before code. |
| BC-4 | Running cost in MVP is zero. Any AI budget is decided before the AI phase. |

## 5 Assumptions & Notes

- **Scope summary.** MVP = FR-1..FR-44, FR-55..FR-58, NFR-1..NFR-13 and
  NFR-15..NFR-17: content entry beside the PDF (with edit/delete and
  publishing rules), the deterministic checker, the child practice flow,
  missions/XP/ranks with a dark/light theme, admin stats and flag queue, the
  settings/`TutorPort` seams, and admin session/password/upload rules. Future = FR-45..FR-54 and NFR-14: AI tutoring, AI-assisted content,
  child accounts, graphic answers, spaced repetition, more grades/locales.
- **Ids carried verbatim.** FR/NFR/TC/BC wording is the PRD's except where
  noted inline: the cross-references in FR-6, FR-39, FR-40 and NFR-9 now
  point inside this file, to the brief, or to the PRD, and the NFR table
  gained a Phase column. The PRD remains the record of
  the vision, UX direction (§9), domain model (§10), architecture (§11),
  delivery plan (§13), risks (§14) and decision log (§16).
- **Some FRs bundle 2–3 testable behaviors** (e.g. FR-5, FR-27, FR-29, FR-36).
  They are kept as single ids to avoid churn in a PRD whose ids are already
  cited; specs in Phase 2 should state each behavior as its own scenario.
- **Verification mechanisms.** Rows tagged `vision-verify` (FR-36, FR-37),
  `recording` (FR-32, NFR-8), `a11y` (NFR-13, FR-58) need a real,
  non-stub mechanism in an owner repo before Phase 4 (lesson
  declared-method-needs-mechanism). `e2e` assumes Playwright against the
  compose stack in the frontend repo.
- **Difficulty (FR-3)** is stored per task. Nothing in MVP uses it beyond
  storage; it is not shown to the child.
- **Week boundary** for the success metric and FR-40 is Monday–Sunday,
  Europe/Prague (PRD §5).
- **Runtime data** (PDFs, images, DB volume) lives outside every repository
  (NFR-3, NFR-4); the pre-commit hook refuses PDFs and runtime-data paths.
- **Capstone fork.** PRD §11.1 assumed the docs repo is a fork of the course
  capstone repo. It is currently a standalone OpenSpec store; whether it
  must become that fork is tracked in `docs/current-state.md`.

## 6 Scope Decisions (checkpoint 1)

Signed off 2026-10-02: the product owner accepted every recommended default
("use defaults"). Record: `docs/qa/checkpoint-1-scope-signoff.md`.

- Decisions that add scope became appended ids: OQ-18 → FR-55, FR-56;
  OQ-19 → FR-57; OQ-25 → FR-58; OQ-23 → NFR-15, NFR-16; OQ-24 → NFR-17.
- Decisions that amend a row are marked *(CP1)* on it: OQ-26 → NFR-10,
  OQ-27 → NFR-8.
- The rest clarify existing requirements. They are binding for the Phase 2
  specs, which must state each one as a scenario on the FR it refines.
- OQ-26 asked which OS the home laptop runs; it was not answered, so the
  cross-platform default stands.

### 6.1 Carried over from the PRD

| # | Question | Decision (accepted default) |
|---|---|---|
| OQ-1 | Theme names: school name, mentor character, rank names | Ship placeholder original names in the skin config now (FR-39); co-design the real names with the child before D6. Not blocking. |
| OQ-2 | Topic taxonomy: own, or aligned to workbook chapters? | Own taxonomy aligned to RVP ZV grade-6 thematic areas. Workbook location is carried by `sourceRef` (FR-13). |
| OQ-3 | Which chapter first? | The one currently taught at school, picked with the child. Not blocking specs. |
| OQ-4 | XP values and rank thresholds | FR-34/35 values. Hint cost floors at 1 (1st-try with 5 hints = 1 XP; revealed is always 1). Mission bonus once per mission, on first completion. Placeholder thresholds 0 / 150 / 400 / 800 / 1500 XP, tuned after week 1. |
| OQ-5 | Hints available before the first attempt? | Yes, on demand, with the FR-34 XP cost. |
| OQ-6 | Admin UI language | English (i18n-ready, NFR-9). |
| OQ-7 | Show the source reference to the child? | Hidden in MVP (admin only). |
| OQ-8 | Diacritics sensitivity for text answers | Insensitive by default, strict per part (FR-19). |
| OQ-9 | Mission size | 10 tasks, matching the success metric. |
| OQ-10 | SDD tooling | **Resolved by ADR-0002:** adapted Project Factory harness over an OpenSpec store (TC-7 note). |

### 6.2 New: practice-flow behavior

| # | Question | Decision (accepted default) |
|---|---|---|
| OQ-11 | Multi-part tasks: on the 2nd attempt, are parts that were already correct locked? When is the task correct? | Correct parts lock and stay shown as correct; the child re-enters only the wrong parts. The task is correct only when every part is correct. |
| OQ-12 | If one part is `UNPARSEABLE` and the others parse, what happens? | The whole submission is refused with a format tip on that part. No attempt is consumed and nothing is stored as an attempt (FR-22). |
| OQ-13 | What counts as "solved" for mission progress (FR-25 x/10) and completion? | A task is resolved when correct or revealed. The mission is complete when all its tasks are resolved. |
| OQ-14 | How is a "session" defined for the metric and FR-40? | A run of answered tasks with no gap over 30 minutes. A qualifying session has ≥ 10 answered tasks. |
| OQ-15 | Can a task belong to more than one mission? | Yes. XP is still awarded once per task, on its first resolution anywhere (FR-33/34). |
| OQ-16 | Are missions unlocked in order, or all open? | All published missions are open. HQ orders them by topic, then mission order. The "Pokračovat" CTA picks the most recent in-progress mission. |
| OQ-17 | What does replaying a completed mission (FR-33) do? | Replay starts fresh attempts that are logged (FR-42) but earn no XP and no bonus. HQ keeps showing the mission as complete. |

### 6.3 New: content-management gaps

| # | Question | Decision (accepted default) |
|---|---|---|
| OQ-18 | The PRD only says "create". Can the admin edit and delete sources, tasks and missions? | Yes, edit everything. Delete only content with no attempts; otherwise unpublish. If accepted → **FR-55** (edit) and **FR-56** (delete rules). |
| OQ-19 | Publishing rules between tasks and missions | A mission can be published only when all its tasks are `PUBLISHED` and `TEXT`. A task in a published mission cannot go back to `DRAFT` until the mission is unpublished. If accepted → **FR-57**. |
| OQ-20 | Editing an answer spec after the child has attempted the task | Allowed. Past verdicts stay as recorded until the admin re-evaluates from the flag queue (FR-41). Re-evaluation only ever adds XP (FR-38). |
| OQ-21 | Who maintains the topic list? | Seeded from configuration (a Flyway seed of the OQ-2 taxonomy). No topic admin UI in MVP. |
| OQ-22 | Where does the child's profile display name come from? | Set once from an env var at first start and stored only in the local DB (NFR-3). No admin UI for it in MVP. |

### 6.4 New: missing non-functional requirements

| # | Question | Decision (accepted default) |
|---|---|---|
| OQ-23 | Admin session and password rules (not in the PRD) | Form login with an HttpOnly, SameSite=Strict session cookie and CSRF protection, 8 h idle timeout. The admin password must be ≥ 12 characters; the backend refuses to start otherwise. No lockout (LAN only). If accepted → **NFR-15** (session) and **NFR-16** (password policy). |
| OQ-24 | Upload limits | PDF ≤ 50 MB; PNG/JPG images ≤ 5 MB each; anything else is rejected with a clear message. Files go to the local storage volume. If accepted → **NFR-17**. |
| OQ-25 | Dark and light themes (PRD §9.1) are not an FR | Follow the OS `prefers-color-scheme` with no in-app toggle. Both themes pass the a11y gate (NFR-13). If accepted → **FR-58**. |
| OQ-26 | NFR-10 says `make backup`, but `make` is not standard on Windows. Which OS does the home laptop run? | Provide a cross-platform `npm run backup` (pg_dump through `docker compose exec`) and amend NFR-10's wording. Keep `make backup` only if the laptop is Linux/macOS. |
| OQ-27 | NFR-8 (≤ 60 s task entry) is tagged `eval`, but a graded rubric eval can't time a human | Retag NFR-8 as `recording`: a timed clip of entering a typical single-part task. |

### 6.5 New: raised during gamification spec authoring (2026-10-03)

Raised by the spec-writer agents in the Phase 2 `spec-pipeline` run.
**Accepted by the product owner on 2026-10-03** ("accept all"), together
with §6.6.

| # | Question | Decision (accepted default) |
|---|---|---|
| OQ-28 | Missions that share tasks (OQ-15): does each mission pay its own completion bonus, and when does a mission complete if its last unresolved tasks were resolved in another mission? | Each mission pays its own bonus once, on its first completion (OQ-4). A mission is complete when all its tasks are resolved, wherever they were resolved (OQ-13, OQ-15). Completion is checked on every first resolution of a task. That resolution completes every mission that contains the task and has no other unresolved task, and pays each of those bonuses in the same award. A mission that is published when all its tasks are already resolved is complete at publish time, and its bonus is credited then. No task XP is awarded in that case. Any rank-up this causes is celebrated the next time the child opens HQ. |
| OQ-29 | Valid range and format of XP values (FR-34/35) and rank thresholds (FR-36) | Every task award, the hint cost and the mission bonus must be a plain integer from 0 to 1000. The minimum award must be from 1 to 1000. Every rank threshold must be a plain integer from 0 to 1 000 000. Values are machine numbers: strings, decimals and locale formats (`"1 500"`, `"10,5"`, `2.5`) are invalid. A missing key is invalid; there are no silent defaults. Invalid XP config stops the backend from starting, and an invalid skin is refused. In both cases the error names the offending key or entry. |

### 6.6 Spec-derived rulings confirmed (2026-10-03)

The Phase 2 spec authors made these rulings where a requirement was silent or
too literal. The product owner accepted all of them on 2026-10-03. The rows
they narrow carry a pointer here.

| # | Ruling | Affects | Where it is specified |
|---|---|---|---|
| CA-D3 | A source's PDF file cannot be replaced; only its metadata is editable. A new file means a new source. | narrows FR-55 | content-authoring, Derived decisions |
| CA-D4 | A source cannot be deleted while any task references it, even if no attempt references that task. | narrows FR-56 | content-authoring, Derived decisions |
| CA-D13 | A `GRAPHIC` task may have zero answer parts; every `TEXT` task has 1..n parts. | departs from FR-6 | content-authoring, Derived decisions |
| OQ-30 | The admin password is at most 72 bytes in UTF-8, because bcrypt reads only the first 72 bytes. The backend refuses to start otherwise. | amends NFR-16 | admin-access, Admin password policy |
| OQ-31 | When uploading a source, title, grade and subject are required; publisher and edition are optional. | clarifies FR-1 | content-authoring, PDF sources |

The other derived decisions in the content-authoring spec (CA-D1..CA-D21)
refine behavior without narrowing a requirement row; they were accepted with
this sign-off.
