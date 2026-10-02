# Product Brief — Doučko

*The business narrative behind `docs/requirements.md`. Split from
`docs/prd.md` (Draft v0.2) in Phase 1. Requirement ids in brackets point to
the requirements document.*

## 1. Who this is for

Doučko ("little tutor") is a private home project built by a parent who is
also a developer. It has exactly one learner: their daughter, a 12-year-old in
grade 6 at a Czech primary school (ZŠ). She practices math from the workbook
her class uses. She likes manga and anime, especially hero-academy and
spy-comedy stories, and she dislikes anything that looks babyish.

Two adults are around her practice:

- **The parent (admin)** types tasks in from the workbook and keeps an eye on
  whether practice actually happens.
- **The father (helper)** speaks Ukrainian and practices with her, but the
  task text is in Czech.

The project is also the capstone for the fwdays Agentic Engineering course
[BC-3]. The delivery itself has to evidence spec-driven, gated, agent-assisted
engineering.

## 2. How practice works today, and what hurts

- **Paper only.** She solves tasks in the workbook or on paper. A parent has
  to check every answer, so feedback comes late or not at all.
- **A language gap.** The father can't easily help with Czech word problems
  without a translation next to the original.
- **Motivation drops quickly.** Plain drill bores a 12-year-old within days.
- **Existing platforms don't fit.** They either give the answer away, or they
  don't follow the Czech curriculum and the workbook her class actually uses.

## 3. What Doučko does, end to end

1. **The parent loads content.** They upload the workbook PDF as a reference
   source [FR-1]. Then they type tasks into a keyboard-first form with the
   PDF open beside it [FR-2, FR-3, NFR-8]. Each task records exactly where it
   came from: source, page, task number [FR-3, FR-13]. A task can have
   images, several answer parts, optional hand-written hints, and a Ukrainian
   translation [FR-4, FR-6..FR-8]. Before publishing, the parent tries
   answers in an **answer tester** to confirm the answer key behaves [FR-10].
   Tasks are grouped into 10-task **missions** within one topic [FR-9, FR-12].
2. **The child practices.** She opens the app on the laptop. There is no
   login; she lands on her **HQ** [FR-24, FR-25]. She picks or continues a
   mission and solves tasks one at a time [FR-26, NFR-7].
3. **Every answer is checked instantly and deterministically.** The checker
   accepts the forms a Czech pupil actually writes: decimal commas, spaces as
   thousands separators, fractions and mixed numbers, units like `cm2`, and
   short text without diacritics [FR-14..FR-21]. Input it can't read gets a
   friendly format tip and costs nothing [FR-22]. Correctness is protected by
   a golden table of at least 150 cases [FR-23].
4. **Two attempts, then calm help.** After a wrong attempt she sees which
   parts are wrong. After the second, the correct answers are shown, without
   blame ("Nevadí, příště!") [FR-27]. She can open hints in order at any
   time [FR-28], and show the Ukrainian text next to the Czech [FR-29].
5. **It feels like a game.** She is a first-year student at an original hero
   academy. Topics are powers she trains, and missions earn XP that raises
   her hero rank [FR-34..FR-37]. Nothing is ever taken away: no lost XP,
   timers, streak penalties or leaderboards [FR-38]. The whole theme is one
   swappable skin [FR-39].
6. **Mistakes in the answer key get fixed.** If she thinks she was right, she
   reports it [FR-30]. The parent sees the report in a flag queue, fixes the
   answer spec, and re-evaluates the attempt, so she gets the XP she earned
   [FR-41].
7. **The parent sees whether it works.** A stats page shows sessions per
   week, tasks per session, first-try rate per topic, hint use and reveals
   [FR-40]. These numbers measure the success metric below.

## 4. Actors and their goals

| Actor | Goal | Key requirements |
|---|---|---|
| **Child** (primary user) | Short, satisfying sessions; clear feedback; a visible sense of progress; visuals that feel grown-up | FR-24..FR-39, NFR-6, NFR-7, NFR-13 |
| **Parent / admin** (content author) | Enter a workbook chapter fast; trust the answer key before publishing; know whether practice happens | FR-1..FR-13, FR-40..FR-42, NFR-1, NFR-8 |
| **Father** (helper) | Read the task in Ukrainian next to the Czech original while practicing together | FR-8, FR-29, FR-43 |

## 5. Success metric

Agreed with the child: **she does 10 tasks from the current chapter on the
site instead of on paper, 3 times a week, for 4 weeks.** The supporting
signals are: zero unresolved checker false negatives (every "I'm right" flag
triaged within 2 days), first-try rate per topic, and hint usage. The last
two are diagnostic only and feed the AI-phase design. Weeks run
Monday–Sunday, Europe/Prague. Measured by FR-40.

## 6. MVP vs Future

| | MVP (this delivery, 1 week) | Future |
|---|---|---|
| **Checking** | Deterministic checker only | AI explains the likely mistake [FR-45]; graphic answers [FR-51] |
| **Tutoring** | 2 attempts → reveal, hand-written hints | Guided (Socratic) mode that leads to the answer without giving it [FR-46]; "explain the topic" [FR-49] |
| **Content** | Manual entry beside the PDF; images cropped outside the app | AI-drafted tasks, hints and translations with review [FR-47, FR-48]; in-app cropping [FR-52] |
| **Practice** | Missions, XP, ranks | Spaced-repetition review missions [FR-53]; cosmetic unlocks |
| **Users** | One hardcoded child profile; password-protected admin | Child login, several children, parent accounts [FR-50] |
| **Languages** | Czech UI; task text in `cs` + `uk` | `ru` and others, more grades and subjects [FR-54] |
| **Runtime** | Docker Compose on the home laptop, LAN only, zero cost [TC-5, NFR-2, BC-4] | Public hosting, only with content licensing [BC-2] |

**The boundary rule:** MVP contains no AI of any kind [TC-6]. It does build
the seams the AI phases plug into: the `TutorPort` that produces feedback
[FR-44], the `answerMode` setting with `GUIDED` reserved [FR-43], and
locales as configuration [FR-8]. Later phases add code instead of rewriting
it.

**What is never cut** (PRD §13): checker correctness and the attempt flow. If
the week runs short, mixed numbers and multi-select go first, then the
separate mission-briefing screen, then the rank-up animation.

## 7. Guardrails

- **Privacy.** The child's name, photos or other PII never enter any
  repository, fixture, log, screenshot or recording [NFR-3].
- **Copyright.** Workbook text, images and answer keys are typed from a
  purchased copy for private use and are never committed. Test fixtures are
  self-authored [NFR-4, BC-2].
- **IP-clean theme.** The skin draws on the hero-academy *genre* only.
  Characters, names, logos and art are original, with no references to the
  manga that inspired it (PRD §9.1).
- **Kind by design.** Copy is encouraging, never mocking ("Skoro! Zkus to
  znovu"), and no game mechanic punishes [FR-38].

## 8. Vocabulary

| Term | Meaning |
|---|---|
| **Source** | An uploaded workbook PDF with its metadata; the reference tasks are typed from. |
| **Task** | One exercise, with a prompt, optional images, 1..n answer parts, optional hints and translations, and a source reference. |
| **Answer part** | One checkable answer within a task (a, b, c…), with its own answer spec. |
| **Answer spec** | The rule the checker applies to a part: type (integer, decimal, fraction, number with unit, choice, text) plus flags such as required unit, lowest terms, tolerance and alternatives. |
| **Modality** | `TEXT` (checkable, served) or `GRAPHIC` (drawing or construction; stored, never served in MVP). |
| **Mission** | An ordered set of (by default 10) published tasks from one topic. |
| **Attempt** | One submission of all parts of a task. Two per task; unparseable input doesn't count. |
| **Reveal** | Showing the correct answers after the second wrong attempt. The task is then `REVEALED`. |
| **HQ** | The child's home screen: rank, XP bar, continue button, missions by topic. |
| **Skin** | The swappable theme: names, ranks, copy, illustrations and colors. |
| **Flag** | A child's "something is wrong with this task" report, triaged by the admin. |
| **Tajenka** | A Czech word-puzzle answer, checked as short text. |
