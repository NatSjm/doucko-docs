# Practice Flow Specification

## Purpose

The child opens the app, picks or continues a mission on HQ, and solves its
tasks one at a time: two attempts per task, then the answer is revealed.
Hints, a Ukrainian translation of the task text and a "report a problem"
link are always at hand, and every attempt is saved immediately so practice
can stop and resume at any point. The child UI is Czech, keyboard-operable
and never punishing.

## Requirements

### Requirement: HQ without login

The child SHALL open the app without logging in and land on **HQ** as the
single hardcoded profile (FR-24). No child-facing screen SHALL ask for a
name, password or profile choice.

#### Scenario: Open the app in a fresh browser

- **GIVEN** a browser with no cookies or local storage for the app
- **WHEN** the child opens the app URL
- **THEN** HQ is shown directly, with no login form and no profile picker

#### Scenario: Child API needs no credentials

- **GIVEN** a request to the child-facing HQ endpoint without any credentials
- **WHEN** the request is made
- **THEN** it succeeds with HTTP 200 and the single profile's HQ data

### Requirement: Child side cannot change content

The child side SHALL have no way to create, change or delete content
(NFR-1). The full rule set, including the admin session and CSRF checks, is
owned by the admin-access capability; this requirement fixes the cases that
can be reached from the practice flow.

#### Scenario: Child browser calls a content-changing admin operation

- **GIVEN** a published task and a client with no admin session, as the child's browser is
- **WHEN** it sends the admin operation that updates that task (`PUT /api/admin/tasks/{taskId}`) with a changed prompt
- **THEN** the response is HTTP 401 with an `application/problem+json` body, and the task's prompt, answer spec and status are unchanged

#### Scenario: Attempt body cannot rewrite the task

- **GIVEN** a published single-part task whose expected answer is `12`
- **WHEN** an attempt is submitted with an extra top-level field `"answerSpec": {"a": "99"}` next to `answers`
- **THEN** the extra field is ignored, the attempt is graded against `12`, and the task's answer spec is unchanged

### Requirement: Mission list on HQ

HQ SHALL list every published mission, grouped by topic and ordered by
mission order within each topic, each showing its progress as "x/N vyřešeno"
and its state: new, in progress or complete (FR-25). A task counts as
resolved when it was answered correctly or revealed; a mission is complete
when all its tasks are resolved (decision OQ-13). All published missions are
open; none is locked behind another (decision OQ-16).

A task that belongs to several missions (decision OQ-15) SHALL have one
resolution shared by all of them: once resolved in any mission it counts as
resolved in the x/N progress and completion of every mission that contains
it, is skipped when continuing those missions, and earns no further XP
anywhere (rules in gamification). The completion bonus is still paid once per
mission (FR-35, gamification).

#### Scenario: Mission states

- **GIVEN** three published missions of 10 tasks in one topic with 0, 4 and 10 tasks resolved
- **WHEN** the child opens HQ
- **THEN** they are shown as new (0/10 vyřešeno), in progress (4/10 vyřešeno) and complete (10/10 vyřešeno)

#### Scenario: Revealed tasks count as resolved

- **GIVEN** a 10-task mission where 9 tasks were answered correctly and 1 was revealed
- **WHEN** the child opens HQ
- **THEN** the mission is shown as complete with 10/10 vyřešeno

#### Scenario: Attempted but unresolved task does not count

- **GIVEN** a 10-task mission where the only activity is one wrong attempt on task 1
- **WHEN** the child opens HQ
- **THEN** the mission shows 0/10 vyřešeno and state in progress

#### Scenario: Grouping and order

- **GIVEN** published missions in topics "Zlomky" and "Desetinná čísla", each topic with missions of order 1 and 2
- **WHEN** the child opens HQ
- **THEN** missions appear under their topic heading, order 1 before order 2 within each topic

#### Scenario: All published missions are open

- **GIVEN** a topic with two published missions of 10 tasks each, mission 1 and mission 2, both new (0/10 vyřešeno)
- **WHEN** the child clicks mission 2 and then its start button
- **THEN** task 1 of mission 2 opens, and no mission on HQ is shown as locked

#### Scenario: Unpublished content is invisible

- **GIVEN** a draft mission and a published mission
- **WHEN** the child opens HQ
- **THEN** HQ lists only the published mission

#### Scenario: Empty HQ

- **GIVEN** no published mission exists
- **WHEN** the child opens HQ
- **THEN** the HQ response is HTTP 200 with an empty mission list, and the screen shows an empty-state message in place of the list and no error message (the exact copy is a frontend design choice)

#### Scenario: Shared task counts in both missions

- **GIVEN** published missions A and B of 10 tasks each that share task T, mission B has no other activity, and the child resolved T in mission A
- **WHEN** the child opens HQ
- **THEN** mission B shows 1/10 vyřešeno and state in progress

#### Scenario: Continuing skips a task resolved in another mission

- **GIVEN** mission B of 10 tasks whose task 1 is task T, already resolved in mission A, and whose tasks 2–10 have no activity
- **WHEN** the child starts mission B
- **THEN** task 2 of mission B opens, not task T

#### Scenario: Shared task closes the second mission

- **GIVEN** the default XP configuration, mission B of 10 tasks with 9 tasks resolved, the 10th being task T, not yet resolved anywhere, and mission A containing T with at least one other unresolved task
- **WHEN** the child resolves T in mission A, correctly on attempt 1 without hints
- **THEN** mission B shows 10/10 vyřešeno and state complete on HQ, the child receives 30 XP in total (10 XP for T plus the 20 XP completion bonus of mission B), and no mission-complete screen is shown because neither the run in A is finished nor was the child practising in B

### Requirement: Start or continue within two clicks

From HQ the child SHALL be able to start or continue a mission in at most 2
clicks (NFR-7). The "Pokračovat" button SHALL open the first unresolved task
of the most recently practiced mission that is in progress (decision OQ-16).
When no mission is in progress the button has no target and SHALL be hidden
(derived from OQ-16). Replays are not "in progress" missions and are never
the target of "Pokračovat" (decision OQ-17: HQ shows a replayed mission as
complete).

#### Scenario: Continue

- **GIVEN** the child last practiced 10-task mission M and resolved its first 4 tasks
- **WHEN** the child clicks "Pokračovat" on HQ
- **THEN** task 5 of mission M opens after that single click

#### Scenario: Most recent in-progress mission wins

- **GIVEN** missions A and B are both in progress and the child's latest attempt was in B
- **WHEN** the child clicks "Pokračovat"
- **THEN** the first unresolved task of B opens

#### Scenario: Start a new mission

- **GIVEN** a new mission on HQ
- **WHEN** the child clicks the mission and then its start button
- **THEN** the first task of that mission opens, after no more than 2 clicks in total

#### Scenario: Nothing to continue

- **GIVEN** every mission is either new or complete, including a complete mission with an unfinished replay
- **WHEN** the child opens HQ
- **THEN** no "Pokračovat" button is shown

### Requirement: Task screen

The task screen SHALL show the Czech prompt, the task's images, and one
input per answer part, labelled with the part label; the child submits all
parts together (FR-26). The whole screen SHALL be operable by keyboard alone
and Enter SHALL submit (NFR-7). The source reference (workbook location)
SHALL NOT be shown to the child or returned by the child-facing API
(decision OQ-7).

The task screen SHALL load in under 1.5 s (NFR-5). A load is measured in the
browser from the moment the child activates the control that opens the task
(click or Enter on "Pokračovat", the start button or "Další úloha"; for a
direct URL, the navigation start) to the moment the prompt text, every task
image (fully decoded) and every part input are rendered. The measurement runs
against the Docker Compose stack (TC-5) with seeded fixture content, on the
machine running the check: the CI runner for the e2e job and the home laptop
for the local check. The same threshold applies on both.

#### Scenario: Multi-part task

- **GIVEN** a published task with parts a and b and one image
- **WHEN** the task screen opens
- **THEN** it shows the prompt, the image and two inputs labelled a and b, with keyboard focus in input a

#### Scenario: Keyboard only

- **GIVEN** the task screen of a two-part task
- **WHEN** the child types into input a, presses Tab, types into input b and presses Enter
- **THEN** both parts are submitted together as one submission

#### Scenario: Every control reachable by keyboard

- **GIVEN** the task screen of a task with hints and a translation
- **WHEN** the child moves through the screen with Tab and Shift+Tab only
- **THEN** every input, the submit button, the hint button, the translation toggle and "Nahlásit problém" receive visible focus and activate with Enter or Space

#### Scenario: Empty part

- **GIVEN** a two-part task with 2 attempts left
- **WHEN** the child submits with part b empty
- **THEN** nothing is sent for checking, part b shows "Vyplň prosím odpověď", and the child still has 2 attempts left

#### Scenario: Source reference hidden

- **GIVEN** a task whose source reference is "PS str. 34, cv. 5"
- **WHEN** the child-facing task data is fetched and the task screen renders
- **THEN** neither the response nor the screen contains the source reference

#### Scenario: Load time

- **GIVEN** the Docker Compose stack with a seeded published task containing one image of at most 500 KB, and a browser with an empty cache
- **WHEN** the task screen is opened 20 times in a row, the first load with the empty (cold) cache and the next 19 with a warm cache, each started from HQ via the start button
- **THEN** every one of the 20 loads, measured from the click to prompt, image and inputs rendered, takes under 1.5 s

#### Scenario: Unknown or unpublished mission

- **GIVEN** a mission id that does not exist or belongs to a draft mission
- **WHEN** the child opens its URL directly
- **THEN** the API answers 404 with a problem+json body, and the child sees "Tuhle misi jsem nenašel." with a button back to HQ

#### Scenario: Graphic tasks are never served

- **GIVEN** a `GRAPHIC` task stored in the content
- **WHEN** the child requests it by id through the child-facing API
- **THEN** the API answers 404 and the task is never shown on the task screen

### Requirement: Task-scoped requests are checked against the content

Every child request that names a task — submitting an attempt, opening a
hint or reporting a problem — SHALL be refused with HTTP 404 and an
`application/problem+json` body, storing nothing, when the task does not
exist, is not published, is a `GRAPHIC` task (TC-8), or, for requests whose
URL names a mission, is not part of that published mission (FR-26, FR-28,
FR-30, NFR-1). A refused request SHALL NOT change any attempt count, hint
count, task state or XP.

#### Scenario: Attempt for a task that does not exist

- **GIVEN** a published mission M and a task id that exists nowhere
- **WHEN** an attempt for that task id is submitted under mission M
- **THEN** the API answers 404 with a problem+json body and no attempt is stored

#### Scenario: Attempt, hint or report for a draft task

- **GIVEN** a draft task with 2 hints
- **WHEN** an attempt, a hint request and a report are each sent for its id
- **THEN** each is answered with 404 and a problem+json body, and no attempt, opened hint or report is stored

#### Scenario: Attempt, hint or report for a graphic task

- **GIVEN** a `GRAPHIC` task with 1 hint that is stored with status published
- **WHEN** an attempt, a hint request and a report are each sent for its id
- **THEN** each is answered with 404 and a problem+json body, and no attempt, opened hint or report is stored

#### Scenario: Task not in the mission of the URL

- **GIVEN** published missions A and B, and a published task T that belongs to A only
- **WHEN** an attempt for T is submitted under mission B (`/api/child/missions/B/tasks/T/attempts`)
- **THEN** the API answers 404 with a problem+json body, no attempt is stored, and T's state in mission A is unchanged

### Requirement: Two attempts, then reveal

Each task SHALL allow 2 attempts (FR-27). After a wrong attempt, the child
SHALL see which parts are wrong but not their correct values. After the
second wrong attempt, the correct answer of every part SHALL be revealed
with the message "Nevadí, příště!" and the task SHALL be marked `REVEALED`.
The reveal SHALL NOT use the wrong-answer (error) styling. A task is correct
only when every part is correct; parts that were correct on the first attempt
SHALL stay locked and shown as correct, and on the second attempt the child
re-enters only the wrong parts (decision OQ-11). A submission refused because
a part cannot be read SHALL leave the attempt count, locked parts and typed
inputs unchanged (decision OQ-12; rules in answer-checking).

The answer-check round trip SHALL take under 300 ms at p95 (NFR-5). It is
measured at the HTTP client, from sending `POST …/attempts` to receiving the
complete response, against the Docker Compose stack (TC-5) on the machine
running the check: the CI runner for the e2e job and the home laptop for the
local check.

#### Scenario: Correct on the first attempt

- **GIVEN** a single-part task with 2 attempts left, never resolved, and no hints opened
- **WHEN** the child answers it correctly on attempt 1
- **THEN** the task is resolved as correct on the first try, the screen shows the message "Výborně!" together with "+10 XP", and a "Další úloha" button leads to the next unresolved task

#### Scenario: Wrong first attempt

- **GIVEN** a task with parts a and b
- **WHEN** attempt 1 has a correct and b wrong
- **THEN** b is highlighted as wrong with "Skoro! Zkus to znovu.", the correct value of b is not shown anywhere on screen or in the response, a is locked as correct, and the attempt indicator shows 1 of 2 attempts used

#### Scenario: Second attempt re-enters only wrong parts

- **GIVEN** attempt 1 had a correct and b wrong
- **WHEN** the second attempt is prepared
- **THEN** input a is read-only and shown as correct, input b is editable, and the submission sends only b

#### Scenario: Locked part resent on the second attempt

- **GIVEN** a two-part task where attempt 1 locked a as correct (expected `12`) and b was wrong
- **WHEN** attempt 2 is submitted through the API with a = `13` and b correct
- **THEN** the value sent for a is ignored and not re-graded, a stays locked as `CORRECT`, and the task is resolved as correct on the second try

#### Scenario: Correct on the second attempt

- **GIVEN** attempt 1 had b wrong
- **WHEN** attempt 2 has b correct
- **THEN** the task is resolved as correct on the second try

#### Scenario: Reveal after two wrong attempts

- **GIVEN** attempt 1 had b wrong
- **WHEN** attempt 2 has b wrong again
- **THEN** the correct values of all parts and the message "Nevadí, příště!" are shown, the task is marked `REVEALED`, and the inputs become read-only
- **AND** neither the revealed values nor the message use the wrong-answer (error) colour role of the design system, the words "Špatně" and "Chyba" appear nowhere on the screen, and no shake, flash or sound plays

#### Scenario: Locale-formatted numbers on the task screen

- **GIVEN** a DECIMAL part expecting 0.5 and an INTEGER part expecting 1000
- **WHEN** the child submits `0,5` and `1 000` (with a non-breaking space)
- **THEN** both parts are graded correct

#### Scenario: Unreadable input keeps the attempt

- **GIVEN** a two-part task where attempt 1 locked a as correct and 1 attempt is left
- **WHEN** the child submits b = `5,,2`
- **THEN** b shows a format tip, a stays locked, b keeps the typed text, and 1 attempt is still left

#### Scenario: Submission naming an unknown part

- **GIVEN** a task with parts a and b and 2 attempts left
- **WHEN** an attempt is submitted with answers for a, b and an extra part key `c`
- **THEN** the API answers 400 with a problem+json body naming `c`, no attempt is stored, and 2 attempts are still left

#### Scenario: No third attempt

- **GIVEN** a task already marked `REVEALED` or correct in the current run of the mission
- **WHEN** another submission for it reaches the API
- **THEN** it is refused with 409 and a problem+json body, and the task's state, attempts and XP are unchanged

#### Scenario: Check round-trip time

- **GIVEN** the Docker Compose stack seeded with a fixture of at least 10 published tasks that together cover every MVP answer type and include at least one two-part task, after 20 warm-up submissions that are not measured
- **WHEN** 200 graded submissions are sent in sequence, each a valid attempt 1 or attempt 2 on a task that still has an attempt left (fresh runs come from replays), with half of them correct and half wrong
- **THEN** the 95th percentile of the 200 HTTP round-trip times is under 300 ms

### Requirement: Oversized input is refused without cost

The child-facing API SHALL refuse oversized input before checking it, with
no attempt consumed and nothing stored (FR-26, FR-30, decision OQ-12 spirit:
input the app cannot take never costs an attempt). The limits are: 100
characters per answer part value (each element of a choice list counts
separately), at most 20 elements in a choice list, 1000 characters for a
report note (the `ReportRequest.note` limit in `api/openapi.yaml`), and 16 KB
for any child request body. The task screen inputs SHALL NOT accept more
characters than these limits. A number that fits the length limit but is
larger than any machine integer is still a readable number and SHALL be
graded by value, never cause a server error.

#### Scenario: Very long answer part

- **GIVEN** a task with 2 attempts left
- **WHEN** an attempt is submitted through the API whose part a is a string of 101 characters
- **THEN** the API answers 400 with a problem+json body naming part a, no attempt is stored, and 2 attempts are still left

#### Scenario: Input field stops at the limit

- **GIVEN** the task screen of a TEXT part
- **WHEN** the child types or pastes 150 characters into its input
- **THEN** the input holds only the first 100 characters

#### Scenario: Huge integer

- **GIVEN** an INTEGER part expecting `12` and 2 attempts left
- **WHEN** the child submits `99999999999999999999`
- **THEN** the part is graded `WRONG` (not `UNPARSEABLE`, not a server error), 1 attempt is left, and the stored raw input is `99999999999999999999`

#### Scenario: Huge integer that is the expected answer

- **GIVEN** an INTEGER part expecting `100000000000000000000`
- **WHEN** the child submits `100 000 000 000 000 000 000` (with non-breaking spaces)
- **THEN** the part is graded `CORRECT`

#### Scenario: Report note too long

- **GIVEN** the report dialog of a task
- **WHEN** a report with reason "Jiné" and a note of 1001 characters reaches the API
- **THEN** the API answers 400 with a problem+json body and no report is stored, and the dialog's note field accepts at most 1000 characters

#### Scenario: Request body too large

- **GIVEN** any child endpoint that accepts a body (attempt, report, profile settings)
- **WHEN** a request with a body larger than 16 KB is sent
- **THEN** the API answers 413 with a problem+json body and nothing is stored

### Requirement: Hints on demand

When a task has hints, the child SHALL be able to open them one at a time,
in order, at any point (FR-28) — including before the first attempt
(decision OQ-5) and after the task is resolved or revealed (FR-28 "at any
point"). Each opened hint SHALL be recorded with the task, once. The hint
button shows how many hints remain; a task without hints shows no hint
button. Once every hint is open the button is disabled and a further hint
request is refused with 409 (derived from FR-28 "one at a time, in order";
`openNextHint` in `api/openapi.yaml`). The XP cost of hints is defined by
gamification.

#### Scenario: Hint before the first attempt

- **GIVEN** a task with 2 hints and no attempt yet
- **WHEN** the child clicks "Nápověda"
- **THEN** hint 1 is shown and 1 hint used is recorded

#### Scenario: Open hints in order

- **GIVEN** a task with 2 hints
- **WHEN** the child opens a hint, then another
- **THEN** hint 1 and then hint 2 are shown, the counter goes 2 → 1 → 0, and 2 hints used are recorded

#### Scenario: Hint after a reveal

- **GIVEN** a task with 2 hints, none opened, marked `REVEALED`
- **WHEN** the child clicks "Nápověda"
- **THEN** hint 1 is shown, and the task stays `REVEALED` with its XP unchanged

#### Scenario: Hints survive a reload

- **GIVEN** the child opened hint 1
- **WHEN** the child reloads the task
- **THEN** hint 1 is still shown and still counts as one hint used

#### Scenario: No hints left

- **GIVEN** all hints of a task are open
- **WHEN** a request for another hint reaches the API
- **THEN** it is refused with 409, nothing new is recorded, and the hint button is disabled on screen

#### Scenario: Task without hints

- **GIVEN** a task with no hints
- **WHEN** the task screen opens
- **THEN** no hint button is shown

### Requirement: Ukrainian translation toggle

When a task has a `uk` translation, the child SHALL be able to show it next
to the Czech text with "Zobrazit ukrajinsky"; the UI itself stays Czech
(FR-29). The toggle state SHALL be remembered in the profile (setting
defined in child-profile) and apply to later tasks and later visits. Hints
and part labels follow the toggle when translated; untranslated text shows
only in Czech.

#### Scenario: Toggle on

- **GIVEN** a task with a `uk` translation
- **WHEN** the child turns on "Zobrazit ukrajinsky"
- **THEN** the Ukrainian prompt is shown next to the Czech prompt, and all buttons and messages stay Czech

#### Scenario: Toggle remembered

- **GIVEN** the toggle was turned on
- **WHEN** the child closes the browser and the next day opens another translated task, even in a different browser on the laptop
- **THEN** the Ukrainian text is shown without turning the toggle on again

#### Scenario: No translation

- **GIVEN** the toggle is on and a task has no `uk` translation
- **WHEN** the task screen opens
- **THEN** the toggle is shown as unavailable ("Překlad není k dispozici") and only Czech text appears

#### Scenario: Translated hint

- **GIVEN** the toggle is on and hint 1 has a `uk` translation
- **WHEN** the child opens hint 1
- **THEN** the hint shows in Czech with the Ukrainian text next to it

### Requirement: Report a problem

From any task the child SHALL be able to report a problem with one of the
reasons "Myslím, že moje odpověď je správně", "Zadání je nejasné" or "Jiné";
"Jiné" requires a note and the other reasons take an optional note (FR-30:
"other + note"). The latest raw attempt of the current run, if any, SHALL be
attached (FR-30). Reporting SHALL NOT change the task's attempts, state or
XP. Reports are handled in the admin flag queue (see progress-stats).

#### Scenario: Report after a wrong verdict

- **GIVEN** a single-part task allowing 2 attempts whose attempt 1 was marked wrong, so 1 attempt is left
- **WHEN** the child reports "Myslím, že moje odpověď je správně"
- **THEN** a report is stored with the task and that attempt's raw input, the child sees "Díky, podívám se na to!", and the child is back on the task with 1 attempt still left

#### Scenario: Report before any attempt

- **GIVEN** a task with no attempt yet
- **WHEN** the child reports "Zadání je nejasné"
- **THEN** a report is stored with the task and no attempt attached

#### Scenario: Report after a reveal

- **GIVEN** a task marked `REVEALED`
- **WHEN** the child reports "Myslím, že moje odpověď je správně"
- **THEN** the report carries the raw input of attempt 2 and the task stays `REVEALED`

#### Scenario: Other reason needs a note

- **GIVEN** the report dialog is open
- **WHEN** the child chooses "Jiné" and sends without a note
- **THEN** the report is not sent and the note field shows "Napiš prosím krátce, co je špatně."

#### Scenario: Other reason without a note through the API

- **GIVEN** a published task
- **WHEN** a report with reason `OTHER` and no note (or a note of only whitespace) reaches the API
- **THEN** the API answers 400 with a problem+json body and nothing is stored

#### Scenario: Report request without a reason

- **GIVEN** a report request to the API with no reason
- **WHEN** it is submitted
- **THEN** the API answers 400 with a problem+json body and nothing is stored

### Requirement: Save and resume

Every attempt and every opened hint SHALL be saved on the server as soon as
it happens (FR-31). Closing the browser mid-mission and coming back SHALL
resume the mission at its first unresolved task, with attempts and hints
already used still counted. A verdict SHALL be shown only after the server
has stored it. When a submission fails without a response, the app SHALL
re-read the task's stored state before letting the child submit again, so an
attempt that was stored but whose response was lost is shown, never sent a
second time (FR-31; the mechanism is an implementation choice).

#### Scenario: Resume after closing the browser

- **GIVEN** a 10-task mission where the child resolved tasks 1–3 and used one attempt on task 4
- **WHEN** the child closes the browser, reopens the app and clicks "Pokračovat"
- **THEN** task 4 opens with 1 of 2 attempts used and the wrong part marked

#### Scenario: Resume skips resolved tasks

- **GIVEN** a 10-task mission where tasks 1, 2 and 4 are resolved and tasks 3 and 5–10 are not
- **WHEN** the child continues the mission
- **THEN** task 3 opens

#### Scenario: Server unreachable on submit

- **GIVEN** a task with 2 attempts left and the backend is unreachable
- **WHEN** the child submits an answer
- **THEN** no verdict is shown, the typed inputs are kept, the message "Nepodařilo se to uložit. Zkus to prosím znovu." appears, and no attempt is stored
- **AND** after the backend is reachable again, submitting the same answer is graded as attempt 1 and the attempt log holds exactly one attempt for the task

#### Scenario: Response lost after the attempt was stored

- **GIVEN** a task with 2 attempts left, and the network drops the response to attempt 1 after the server stored attempt 1 as wrong
- **WHEN** the child, who sees "Nepodařilo se to uložit. Zkus to prosím znovu.", presses submit again
- **THEN** the screen shows the stored verdict of attempt 1 with 1 of 2 attempts used, and the attempt log holds exactly one attempt for the task

### Requirement: Mission complete screen

When the last unresolved task of a mission is resolved, a mission-complete
screen SHALL show the XP earned in this run of the mission (task XP plus any
completion bonus), the number of tasks solved on the first try, and a
rank-up if one happened (FR-32). XP values and ranks come from gamification
(FR-34, FR-35, decision OQ-4).

#### Scenario: Mission summary

- **GIVEN** the default XP configuration and a 10-task mission completed for the first time, in which the child opened no hints and resolved 7 tasks correctly on the first try, 2 on the second try and revealed 1, none of them resolved earlier in another mission
- **WHEN** the child resolves the last task
- **THEN** the screen shows "7 na první pokus" and 101 XP earned (7 × 10 + 2 × 5 + 1 × 1 for tasks, plus the 20 XP completion bonus)

#### Scenario: Shared task earns nothing on the summary

- **GIVEN** the default XP configuration and a 10-task mission completed for the first time with no hints, in which 9 tasks were correct on the first try in this mission and task T had already been resolved in another mission
- **WHEN** the child resolves the last task
- **THEN** the screen shows "9 na první pokus" and 110 XP earned (9 × 10 + 20 bonus; T contributes 0)

#### Scenario: Last task revealed still completes

- **GIVEN** a 10-task mission with 9 tasks resolved
- **WHEN** the last task is revealed after two wrong attempts
- **THEN** the mission-complete screen is shown

#### Scenario: Rank-up on completion

- **GIVEN** the mission's XP takes the child over the next rank threshold
- **WHEN** the mission-complete screen opens
- **THEN** it includes the rank-up celebration with the new rank name

#### Scenario: No rank-up

- **GIVEN** the mission's XP does not cross a rank threshold
- **WHEN** the mission-complete screen opens
- **THEN** no rank-up celebration is shown

### Requirement: Replay completed missions

A completed mission SHALL be replayable (FR-33). A replay starts a new run
with fresh attempts on every task; these attempts are logged but earn no XP
and no mission bonus, because XP is awarded only on a task's first
resolution (decision OQ-17). HQ keeps showing the mission as complete during
and after a replay.

A replay run SHALL be saved like any run (FR-31): when the child leaves a
replay midway and later opens the mission from HQ and presses its start
button, the unfinished replay run SHALL resume at its first task unresolved
in that run. A new replay run starts only once the previous one is
finished; a replay request while a replay run is unfinished returns that run
unchanged.

#### Scenario: Replay earns no XP

- **GIVEN** a completed mission of 10 single-part tasks and the child has 250 XP
- **WHEN** the child replays it and answers every task correctly on the first try
- **THEN** the child's total XP stays 250, exactly 10 new attempts (one per task) are in the attempt log for this replay, and the mission-complete screen shows 0 XP earned

#### Scenario: Replay starts fresh

- **GIVEN** a completed mission whose task 1 was revealed in the first run
- **WHEN** the child starts a replay
- **THEN** task 1 opens with 2 attempts left and empty inputs

#### Scenario: HQ during a replay

- **GIVEN** a completed mission of 10 tasks and the child stopped a replay of it after resolving 3 tasks in the replay
- **WHEN** the child opens HQ
- **THEN** the mission still shows complete with 10/10 vyřešeno and no "Pokračovat" button points to it

#### Scenario: Resume an unfinished replay

- **GIVEN** a completed mission of 10 tasks and the child resolved tasks 1–3 of a replay and used one attempt on task 4, then closed the browser
- **WHEN** the child reopens the app, clicks the mission on HQ and then its start button
- **THEN** task 4 of the replay opens with 1 of 2 attempts used, and tasks 1–3 are not asked again

#### Scenario: Replay request during an unfinished replay

- **GIVEN** an unfinished replay run of a completed mission with 3 tasks resolved in it
- **WHEN** another replay request for the mission reaches the API
- **THEN** the API returns the same unfinished run, still with 3 tasks resolved, and no new run is created

#### Scenario: Replay of an unfinished mission is refused

- **GIVEN** a mission in progress
- **WHEN** a replay request for it reaches the API
- **THEN** it is refused with 409 and a problem+json body, and the mission's progress is unchanged

### Requirement: Deterministic feedback through the tutor seam

Feedback after each attempt SHALL be produced only through the `TutorPort`
seam, whose MVP implementation is deterministic: the per-part verdicts, a
pointer to the next unused hint if there is one, and on the second wrong
attempt the revealed answers (FR-44). The feedback object (`feedback` in
`AttemptResult`, `api/openapi.yaml`) SHALL contain no ids and no timestamps.
Replacing the tutor implementation SHALL NOT change how attempts are
submitted (`AttemptRequest` stays as it is). MVP calls no AI or LLM service
(TC-6) and uses the `DIRECT` answer mode only (see child-profile).

#### Scenario: Feedback after a wrong attempt with hints left

- **GIVEN** a task with 2 hints, none opened
- **WHEN** attempt 1 is wrong
- **THEN** the feedback carries the per-part verdicts and points to hint 1, and no correct value

#### Scenario: Feedback after a wrong attempt with no hints left

- **GIVEN** a task whose hints are all open
- **WHEN** attempt 1 is wrong
- **THEN** the feedback carries the per-part verdicts and no hint pointer

#### Scenario: Same input, same feedback

- **GIVEN** two fresh runs of the same task with the same hints opened
- **WHEN** the same wrong input is submitted as attempt 1 in both
- **THEN** the `feedback` objects of the two responses are byte-identical after JSON canonicalization, and the `parts` lists are equal in every `key`, `verdict`, `normalized`, `formatTip` and `locked` value

#### Scenario: Feedback only through the tutor seam

- **GIVEN** the backend source code
- **WHEN** the backend architecture test runs
- **THEN** it passes only if the attempt-submission use case obtains feedback exclusively through `TutorPort`, and the MVP has exactly one `TutorPort` implementation, the deterministic one

#### Scenario: Swapping the tutor leaves submission unchanged

- **GIVEN** a backend test in which the deterministic `TutorPort` implementation is replaced by a test double that returns `nextHintIndex = 2` for every attempt
- **WHEN** the same `AttemptRequest` body is submitted as before the swap
- **THEN** it is accepted unchanged and the response's `feedback.nextHintIndex` is 2

#### Scenario: Feedback never comes from AI in MVP

- **GIVEN** the MVP backend build
- **WHEN** its resolved dependency list is inspected and the attempt-checking integration tests run with all outbound network connections from the backend container denied
- **THEN** no dependency has a group id starting with `com.openai`, `dev.langchain4j` or `org.springframework.ai`, and every attempt-checking test passes with the network denied (TC-6)

## Explicit exclusions (MVP)

- No child login, no multiple children; one hardcoded profile.
- No Guided (Socratic) mode, no AI explanations, no spaced-repetition review
  missions.
- `GRAPHIC` tasks and unpublished content are stored but never served to the
  child.
- No locked missions, no timers or time pressure of any kind.
- The source reference is never shown to the child.
- No Ukrainian UI: only task text (prompt, hints, part labels) is translated.
- Laptop only (≥ 1280×720); no mobile layout.
- No request-id or idempotency key on attempt submission; double-counting
  after a lost response is prevented by re-reading the task state first.
- Content changes from the child side are covered here only for the
  practice-flow cases; the full NFR-1 rule set belongs to admin-access.
