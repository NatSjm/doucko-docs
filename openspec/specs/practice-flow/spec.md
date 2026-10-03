# Practice Flow Specification

## Purpose

The child opens the app, picks or continues a mission on HQ, and solves its
tasks one at a time: two attempts per task, then the answer is revealed.
Hints, a Ukrainian translation of the task text and a "report a problem"
link are always at hand. Every attempt is saved immediately, so practice can
stop and resume at any point. The child UI is Czech and never punishing.

## Requirements

### Requirement: HQ without login

The child SHALL open the app without logging in and land on **HQ** as the
single profile (FR-24).

#### Scenario: Open the app

- **WHEN** the child opens the app URL in a fresh browser
- **THEN** HQ is shown directly, with no login form

### Requirement: Mission list on HQ

HQ SHALL list every published mission, grouped by topic and ordered by
mission order within each topic, each showing its progress as "x/N vyřešeno"
and its state: new, in progress or complete (FR-25). A task counts as solved
(resolved) when it was answered correctly or revealed; a mission is complete
when all its tasks are resolved (decision OQ-13). All published missions are
open; none is locked behind another (decision OQ-16).

#### Scenario: Mission states

- **GIVEN** three published missions in one topic with 0/10, 4/10 and 10/10 tasks resolved
- **WHEN** the child opens HQ
- **THEN** they are shown as new, in progress (4/10) and complete

#### Scenario: Revealed tasks count as resolved

- **GIVEN** a mission where 9 tasks were answered correctly and 1 was revealed
- **THEN** HQ shows it as complete with 10/10

#### Scenario: Unpublished content is invisible

- **GIVEN** a draft mission and a published mission
- **THEN** HQ lists only the published mission

### Requirement: Continue within two clicks

From HQ the child SHALL be able to start or continue a mission in at most 2
clicks (NFR-7). The "Pokračovat" button SHALL open the first unresolved task
of the most recently practiced in-progress mission; when no mission is in
progress it is hidden.

#### Scenario: Continue

- **GIVEN** the child last practiced mission M and resolved its first 4 tasks
- **WHEN** she clicks "Pokračovat" on HQ
- **THEN** task 5 of mission M opens

#### Scenario: Start a new mission

- **WHEN** the child clicks a new mission on HQ and then its start button
- **THEN** the first task of that mission opens

### Requirement: Task screen

The task screen SHALL show the Czech prompt, the task's images, and one input
per answer part, labelled with the part label; the child submits all parts
together, and Enter submits (FR-26, NFR-7). The whole screen SHALL be
operable by keyboard alone (NFR-7). The screen SHALL load in under 1.5 s on
the home laptop (NFR-5). The source reference SHALL NOT be shown to the
child (decision OQ-7).

#### Scenario: Multi-part task

- **GIVEN** a task with parts a and b
- **WHEN** the task screen opens
- **THEN** it shows the prompt, the images and two labelled inputs, with focus in input a

#### Scenario: Keyboard only

- **WHEN** the child fills both inputs using Tab and presses Enter
- **THEN** both parts are submitted together

#### Scenario: Empty part

- **WHEN** the child submits with part b empty
- **THEN** nothing is submitted, part b is marked "Vyplň prosím odpověď", and no attempt is used

### Requirement: Two attempts, then reveal

Each task SHALL allow 2 attempts (FR-27). After a wrong attempt, the child
SHALL see which parts are wrong but not their correct values. After the
second wrong attempt, the correct answer of every part SHALL be revealed
calmly ("Nevadí, příště!") and the task SHALL be marked `REVEALED`. A task is
correct only when every part is correct; parts that were correct on the
first attempt SHALL stay locked as correct, and on the second attempt the
child re-enters only the wrong parts (decision OQ-11). An unparseable
submission does not use an attempt (see answer-checking). The answer check
round-trip SHALL take under 300 ms at p95 on the home laptop (NFR-5).

#### Scenario: Correct on the first attempt

- **WHEN** the child answers every part correctly on attempt 1
- **THEN** the task is resolved as correct on the first try, with a celebration and the XP earned

#### Scenario: Wrong first attempt

- **GIVEN** a task with parts a and b
- **WHEN** attempt 1 has a correct and b wrong
- **THEN** b is highlighted as wrong with "Skoro! Zkus to znovu.", the correct value of b is not shown, a is locked as correct, and the attempt indicator shows one attempt used

#### Scenario: Correct on the second attempt

- **GIVEN** attempt 1 had b wrong
- **WHEN** attempt 2 has b correct
- **THEN** the task is resolved as correct on the second try

#### Scenario: Reveal after two wrong attempts

- **GIVEN** attempt 1 had b wrong
- **WHEN** attempt 2 has b wrong again
- **THEN** the correct values of all parts are shown with "Nevadí, příště!", the task is marked `REVEALED`, and no further attempt is accepted

#### Scenario: Submitting a resolved task again

- **GIVEN** a task already resolved in the current run of the mission
- **WHEN** another submission for it arrives
- **THEN** it is refused and the resolved state is unchanged

### Requirement: Hints on demand

When a task has hints, the child SHALL be able to open them one at a time,
in order, at any point, including before the first attempt (FR-28, decision
OQ-5). Each opened hint SHALL be recorded with the task. The hint button
shows how many hints remain; a task without hints shows no hint button. The
XP cost of hints is defined by gamification.

#### Scenario: Open hints in order

- **GIVEN** a task with 2 hints
- **WHEN** the child opens a hint, then another
- **THEN** hint 1 and then hint 2 are shown, the counter goes 2 → 1 → 0, and 2 hints used are recorded

#### Scenario: Hints survive a reload

- **GIVEN** the child opened hint 1
- **WHEN** she reloads the task
- **THEN** hint 1 is still shown and still counts once

### Requirement: Ukrainian translation toggle

When a task has a `uk` translation, the child SHALL be able to show it next
to the Czech text with "Zobrazit ukrajinsky"; the UI itself stays Czech
(FR-29). The toggle state SHALL be remembered in the profile and apply to
the next tasks and the next visit. Hints and part labels follow the toggle
when translated; untranslated text shows only in Czech.

#### Scenario: Toggle on

- **GIVEN** a task with a `uk` translation
- **WHEN** the child turns on "Zobrazit ukrajinsky"
- **THEN** the Ukrainian prompt is shown next to the Czech prompt, and buttons and messages stay Czech

#### Scenario: Toggle remembered

- **GIVEN** the toggle was turned on
- **WHEN** the child closes the browser and opens another translated task the next day
- **THEN** the Ukrainian text is shown without turning the toggle on again

#### Scenario: No translation

- **GIVEN** a task without a `uk` translation
- **THEN** the toggle is shown as unavailable and only Czech text appears

### Requirement: Report a problem

From any task the child SHALL be able to report a problem with one of the
reasons "Myslím, že moje odpověď je správně", "Zadání je nejasné" or "Jiné"
plus an optional note (required for "Jiné"); the latest raw attempt, if any,
SHALL be attached (FR-30). Reporting SHALL NOT change the task's attempts,
state or XP.

#### Scenario: Report after a wrong verdict

- **GIVEN** the child's attempt 1 was marked wrong
- **WHEN** she reports "Myslím, že moje odpověď je správně"
- **THEN** a report is stored with the task and that attempt's raw input, she sees a thank-you message, and she can continue

#### Scenario: Other reason needs a note

- **WHEN** the child chooses "Jiné" without a note
- **THEN** the report is not sent and the note field asks for a short description

### Requirement: Save and resume

Every attempt and every opened hint SHALL be saved immediately (FR-31).
Closing the browser mid-mission and coming back SHALL resume the mission at
its first unresolved task, with attempts already used still counted.

#### Scenario: Resume after closing the browser

- **GIVEN** the child resolved tasks 1–3 and used one attempt on task 4
- **WHEN** she closes the browser, reopens the app and continues the mission
- **THEN** task 4 opens with one attempt already used

### Requirement: Mission complete screen

When the last task of a mission is resolved, a mission-complete screen SHALL
show the XP earned in this mission, the number of tasks solved on the first
try, and a rank-up if one happened (FR-32).

#### Scenario: Mission summary

- **GIVEN** the child resolved 7 tasks on the first try, 2 on the second and revealed 1
- **WHEN** she resolves the last task
- **THEN** the screen shows "7 na první pokus" and the XP total earned in this mission

#### Scenario: Rank-up on completion

- **GIVEN** the mission's XP takes the child over the next rank threshold
- **THEN** the mission-complete screen includes the rank-up celebration

### Requirement: Replay completed missions

A completed mission SHALL be replayable (FR-33). A replay starts fresh
attempts on every task; these attempts are logged but earn no XP and no
mission bonus, because XP is awarded only on a task's first resolution
(decision OQ-17). HQ keeps showing the mission as complete during and after a
replay.

#### Scenario: Replay earns no XP

- **GIVEN** a completed mission
- **WHEN** the child replays it and answers every task correctly on the first try
- **THEN** her total XP is unchanged, the attempts are logged, and the mission-complete screen shows 0 XP earned

### Requirement: Deterministic feedback through the tutor seam

Feedback after each attempt SHALL be produced by a single tutor component
whose MVP behavior is deterministic: the per-part verdicts, a pointer to the
next unused hint if there is one, and on the second wrong attempt the
revealed answers (FR-44). The feedback contract SHALL already leave room for
a later AI tutor without changing how attempts are submitted. MVP uses
`DIRECT` answer mode only (see child-profile).

#### Scenario: Feedback after a wrong attempt with hints left

- **GIVEN** a task with 2 hints, none opened
- **WHEN** attempt 1 is wrong
- **THEN** the feedback carries the per-part verdicts and points to hint 1

#### Scenario: Feedback never comes from AI in MVP

- **WHEN** any attempt is checked
- **THEN** no external AI service is called (TC-6)

## Explicit exclusions (MVP)

- No child login, no multiple children; one hardcoded profile.
- No Guided (Socratic) mode, no AI explanations, no spaced-repetition review
  missions.
- `GRAPHIC` tasks and unpublished content are never served.
- No timers or time pressure of any kind.
- Laptop only (≥ 1280×720); no mobile layout.
