# Progress Stats Specification

## Purpose

The admin (parent) needs to know whether practice actually happens and
whether the checker can be trusted. This capability keeps a complete,
append-only attempt log, turns it into weekly practice statistics that
measure the success metric (≥ 3 sessions of ≥ 10 tasks per week, for 4
weeks), and gives the admin a flag queue of the child's problem reports where
a wrong answer key can be fixed and the reported attempt re-evaluated. All of
it is admin-only; the admin UI is English.

## Requirements

### Requirement: Attempt log contents

Every graded attempt SHALL be stored immediately with, per answer part, the
raw input exactly as typed and the normalized input, plus the per-part
verdicts, the number of hints opened on the task at the time of the attempt,
the attempt number and a timestamp (FR-42). Submissions refused as
`UNPARSEABLE` are not attempts and SHALL NOT be stored in the log (see
answer-checking). Attempts made while replaying a completed mission SHALL be
logged like any other attempt and SHALL be identifiable as replay attempts
(see practice-flow, decision OQ-17).

#### Scenario: Attempt is logged with raw and normalized input

- **GIVEN** a two-part task with no hints opened
- **WHEN** the child submits attempt 1 with a = `12` and b = `0,5`
- **THEN** the log holds one entry with raw `12` and `0,5`, normalized `12` and `0.5`, a verdict for each part, hints used 0, attempt number 1 and a timestamp of the submission

#### Scenario: Locale-formatted input is kept verbatim

- **GIVEN** a single-part integer task
- **WHEN** the child submits `1 000` with a no-break space (U+00A0) as the thousands separator
- **THEN** the logged raw input contains the U+00A0 character unchanged and the logged normalized input is `1000`

#### Scenario: Hints used are recorded

- **GIVEN** the child opened 2 hints on a task
- **WHEN** she submits attempt 1
- **THEN** the logged entry shows hints used 2

#### Scenario: Unparseable submission is not logged

- **GIVEN** a task with no logged attempts
- **WHEN** the child submits `5,,2` and it is refused as `UNPARSEABLE`
- **THEN** the attempt log still holds no entry for that task

#### Scenario: Replay attempts are logged

- **GIVEN** a completed mission
- **WHEN** the child replays it and submits an answer to its first task
- **THEN** a new log entry with attempt number 1, marked as a replay attempt, is stored for that task, and the earlier entries are unchanged

### Requirement: Attempt log is append-only

Logged attempts SHALL never be edited or deleted by any operation. An answer
spec MAY be edited after the child has attempted the task; the verdicts
already recorded SHALL stay exactly as recorded until the admin re-evaluates
from the flag queue (decision OQ-20, FR-42). A re-evaluation SHALL be
recorded alongside the original verdict, with its own timestamp, never in
place of it. The admin sees both verdicts on the report's flag-queue entry
(FR-41); MVP has no other admin view of the attempt log.

#### Scenario: Editing an answer spec keeps past verdicts

- **GIVEN** a logged attempt `0,5` with verdict `WRONG` against an expected value `0.05`
- **WHEN** the admin changes the expected value to `0.5` and saves the task
- **THEN** the logged attempt still shows verdict `WRONG`, and the child's task state and XP are unchanged

#### Scenario: Re-evaluation keeps the original verdict

- **GIVEN** a report whose attached attempt had verdict `WRONG` and which the admin re-evaluated to `CORRECT`, so the report is `FIXED`
- **WHEN** the admin opens the flag queue filtered by `FIXED`
- **THEN** that report's entry shows both the original verdict `WRONG` and the re-evaluated verdict `CORRECT`, each with its own timestamp

### Requirement: Session definition

A **session** SHALL be a run of logged attempts in which no two consecutive
attempts are more than 30 minutes apart; a gap of exactly 30 minutes keeps
the session going (decision OQ-14, FR-40). The **answered tasks** of a
session are the distinct tasks with at least one logged attempt in it. A
**qualifying session** has at least 10 answered tasks. A session SHALL count
in the week (Monday 00:00 – Sunday 24:00, Europe/Prague) in which its first
attempt falls. Replay attempts count towards sessions and answered tasks like
any other attempt.

#### Scenario: A 20-minute gap keeps one session

- **GIVEN** the only attempts of a week: 6 tasks answered between 16:00 and 16:20 and then 5 other tasks between 16:40 and 16:55 on the same day
- **WHEN** the admin opens the stats page
- **THEN** that week shows 1 session, 1 qualifying session and session sizes of 11 answered tasks

#### Scenario: A 35-minute gap splits the session

- **GIVEN** the only attempts of a week: 6 tasks answered between 16:00 and 16:20 and then 5 other tasks between 16:55 and 17:10 on the same day
- **WHEN** the admin opens the stats page
- **THEN** that week shows 2 sessions, 0 qualifying sessions and session sizes of 6 and 5 answered tasks

#### Scenario: Exactly 30 minutes is still the same session

- **GIVEN** the only attempts of a week are two attempts on different tasks at 16:20:00 and 16:50:00 on the same day
- **WHEN** the admin opens the stats page
- **THEN** that week shows 1 session with 2 answered tasks

#### Scenario: Two attempts on one task count once

- **GIVEN** the only session of a week, in which the child made 2 attempts on each of 10 tasks
- **WHEN** the admin opens the stats page
- **THEN** that week shows 1 session of 10 answered tasks and 1 qualifying session

#### Scenario: Week boundary in Europe/Prague

- **GIVEN** a session whose first attempt is on Sunday at 23:40 Europe/Prague time and whose last attempt is on Monday at 00:15
- **WHEN** the admin opens the stats page
- **THEN** the session counts once, in the week that ends on that Sunday, and not in the following week

### Requirement: Weekly hint and reveal figures

The weekly **hints used** figure SHALL be the number of hints opened in that
week, each hint counted in the week (Europe/Prague) in which it was opened
(FR-40). It SHALL be derived from the hint-open records of practice-flow
(practice-flow), each of which SHALL carry the time the hint was opened — not from
the cumulative "hints used" stored on attempts (FR-42), which says nothing
about when a hint was opened. A hint opened on a task with no later attempt
SHALL still count. The weekly **revealed tasks** figure SHALL be the number of
reveals in that week, each counted in the week of the attempt that caused it
(the second wrong attempt of a run). Weekly figures describe practice as it
happened: hints opened and reveals during a replay run SHALL count in their
week, and a later re-evaluation SHALL NOT remove a reveal from its week.

#### Scenario: Hint usage and reveals per week

- **GIVEN** in one week the child opened 7 hints and 3 tasks were revealed
- **WHEN** the admin opens the stats page
- **THEN** that week shows 7 hints used and 3 revealed tasks

#### Scenario: Hint counts in the week it was opened

- **GIVEN** the child opened 2 hints on a task on Sunday at 23:50 Europe/Prague time and made attempt 1 on it on Monday at 00:05
- **WHEN** the admin opens the stats page
- **THEN** the week ending on that Sunday shows those 2 hints used and the following week shows 0 hints used for that task

#### Scenario: Hint without a later attempt counts

- **GIVEN** in a week with no other activity the child opened 1 hint on a task and never submitted an attempt on it
- **WHEN** the admin opens the stats page
- **THEN** that week shows 1 hint used and 0 sessions

#### Scenario: Replay hints and reveals count in their week

- **GIVEN** in a week with no other activity the child replays a completed mission, opens 1 hint on a task with a still unopened hint, and has another task revealed after two wrong attempts in that replay
- **WHEN** the admin opens the stats page
- **THEN** that week shows 1 hint used and 1 revealed task

#### Scenario: Re-evaluation does not remove a reveal from its week

- **GIVEN** a week that shows 1 revealed task, and that reveal is later re-evaluated to correct on the 2nd attempt
- **WHEN** the admin opens the stats page
- **THEN** that week still shows 1 revealed task

### Requirement: Practice statistics page

The admin stats page SHALL show, for each of the N most recent weeks (the
current week included): the number of sessions, the number of qualifying
sessions, the answered-task count of each session, the hints used and the
revealed tasks of that week; and, per topic, the first-try rate (FR-40). N is
the requested week count, an integer from 1 to 52 inclusive, default 4 when
not given. The response SHALL contain exactly N week entries, each
identified by its Monday; weeks without activity show zeros.

The **first-try rate** of a topic SHALL be the share of its tasks whose
current first-resolution outcome is correct on the 1st attempt, among its
tasks that have been resolved at least once. The current first-resolution
outcome is the outcome after any re-evaluation (see re-evaluation), so a
checker error corrected by the admin no longer lowers the rate; replays do
not change it (decision OQ-17).

The page SHALL show whether the success metric is met: at least 3 qualifying
sessions in each of the 4 most recent completed weeks — the 4 weeks before
the current week (FR-40, product brief §5). The metric SHALL use those 4
weeks whatever week count was requested. Weeks before the first logged
attempt count as weeks with 0 qualifying sessions, so with fewer than 4
completed weeks of history the metric is not met; MVP has no separate
"pending" state. How the page presents empty states and which week fell
short is a frontend design choice; the figures themselves are the acceptance
criteria.

#### Scenario: First-try rate per topic

- **GIVEN** in topic "Desetinná čísla" 8 tasks have been resolved: 6 correct on the 1st attempt, 1 correct on the 2nd attempt and 1 revealed
- **WHEN** the admin opens the stats page
- **THEN** the topic shows a first-try rate of 75 % (6 of 8)

#### Scenario: Replay does not change the first-try rate

- **GIVEN** a task whose first resolution was a reveal
- **WHEN** the child replays its mission and answers it correctly on the 1st attempt
- **THEN** the topic's first-try rate is unchanged, while the replay attempt counts towards that week's sessions and answered tasks

#### Scenario: Re-evaluated outcome is used for the first-try rate

- **GIVEN** a topic with 4 resolved tasks, 2 correct on the 1st attempt and 2 revealed, so its first-try rate is 50 %
- **WHEN** the admin re-evaluates a report so that one of the revealed tasks becomes correct on the 1st attempt
- **THEN** the topic shows a first-try rate of 75 % (3 of 4)

#### Scenario: Success metric met

- **GIVEN** each of the 4 most recent completed weeks has 3 qualifying sessions
- **WHEN** the admin opens the stats page
- **THEN** the page marks the success metric as met

#### Scenario: Success metric not met

- **GIVEN** 3 of the 4 most recent completed weeks have 3 qualifying sessions and one has 2
- **WHEN** the admin opens the stats page
- **THEN** the page marks the success metric as not met, and the week with 2 shows 2 qualifying sessions

#### Scenario: Current week does not count towards the metric

- **GIVEN** each of the 4 most recent completed weeks has 3 qualifying sessions and the current week has 0
- **WHEN** the admin opens the stats page
- **THEN** the page marks the success metric as met

#### Scenario: Less than 4 completed weeks of history

- **GIVEN** the first attempt ever was logged 2 completed weeks ago, and each of those 2 completed weeks has 5 qualifying sessions
- **WHEN** the admin opens the stats page
- **THEN** the page marks the success metric as not met, and no error is shown

#### Scenario: Metric is independent of the requested week count

- **GIVEN** each of the 4 most recent completed weeks has 3 qualifying sessions and the 5th most recent completed week has 0
- **WHEN** the stats API is asked for 1 week and then for 12 weeks
- **THEN** both responses report the success metric as met, the first holds 1 week entry (the current week) and the second 12

#### Scenario: Default week count

- **GIVEN** an admin session
- **WHEN** the stats API is called without a week count
- **THEN** it answers 200 with exactly 4 week entries, the current week included

#### Scenario: Week count boundaries are accepted

- **GIVEN** an admin session and an app used for 2 weeks
- **WHEN** the stats API is asked for 1 week and then for 52 weeks
- **THEN** it answers 200 with exactly 1 and exactly 52 week entries, and the weeks before the first attempt show 0 sessions, 0 hints used and 0 revealed tasks

#### Scenario: No data yet

- **GIVEN** no attempts and no opened hints exist
- **WHEN** the admin opens the stats page
- **THEN** every week shows 0 sessions, 0 qualifying sessions, 0 hints used and 0 revealed tasks, the success metric is marked not met, the page shows an empty-state message, and no error is shown

#### Scenario: Topic with no resolved tasks

- **GIVEN** a topic with published tasks, none of them resolved yet
- **WHEN** the admin opens the stats page
- **THEN** the topic's first-try rate is shown as "—" rather than 0 % or an error

#### Scenario: Out-of-range week count

- **GIVEN** an admin session
- **WHEN** the stats API is asked for 0, -1 or 53 weeks
- **THEN** it answers 400 with a problem+json body naming the week count, and returns no statistics

#### Scenario: Oversized week count

- **GIVEN** an admin session
- **WHEN** the stats API is asked for 2147483648 weeks or for a 40-digit week count
- **THEN** it answers 400 with a problem+json body naming the week count, never 500, and the value is not clamped to 52

#### Scenario: Non-numeric or locale-formatted week count

- **GIVEN** an admin session
- **WHEN** the stats API is asked for a week count of `abc`, `4.5`, `4,5`, `1 000` (with a space or a U+00A0 no-break space), `٤` (Arabic-Indic digit four) or an empty value
- **THEN** each request answers 400 with a problem+json body naming the week count, and none is read as 4 or as any other number

### Requirement: Flag queue

The admin SHALL see a flag queue of the child's problem reports, each with
the task, the reason, the note, and — when an attempt is attached — that
attempt's raw input and the checker's per-part verdict, plus the
re-evaluated verdict when there is one (FR-41). Raw input SHALL be returned
and shown in full, exactly as logged, without truncation. Reports SHALL have
the status `OPEN`, `FIXED` or `DISMISSED`. The queue SHALL list `OPEN`
reports first, oldest first, and SHALL be filterable by status; the filter
accepts exactly those three values, case-sensitive. From a report the admin
SHALL be able to open the task to fix its answer spec (see
content-authoring).

#### Scenario: Report appears in the queue

- **GIVEN** the child reported "Myslím, že moje odpověď je správně" after attempt 1 `0,5` was marked `WRONG`
- **WHEN** the admin opens the flag queue
- **THEN** an `OPEN` entry shows the task, the reason, raw input `0,5` and verdict `WRONG`

#### Scenario: Report without an attempt

- **GIVEN** the child reported "Zadání je nejasné" before any attempt on the task
- **WHEN** the admin opens the flag queue
- **THEN** the entry shows the task and the reason with no attempt, and offers dismiss but not re-evaluate

#### Scenario: Long raw input is shown in full

- **GIVEN** a report whose attached attempt has a TEXT raw input of 100 Unicode code points (the longest input the checker grades, see answer-checking)
- **WHEN** the admin opens the flag queue
- **THEN** the API returns all 100 code points unchanged, and the entry displays the whole input wrapped within the entry, with no ellipsis and no horizontal scrolling of the page

#### Scenario: Queue order

- **GIVEN** an `OPEN` report from Monday, an `OPEN` report from Wednesday and a `DISMISSED` report from Sunday the week before
- **WHEN** the admin opens the flag queue without a filter
- **THEN** the order is Monday's report, Wednesday's report, then the dismissed one

#### Scenario: Filter by status

- **GIVEN** reports in all three statuses
- **WHEN** the admin filters the queue by `FIXED`
- **THEN** only `FIXED` reports are listed

#### Scenario: Unknown or wrong-case status filter

- **GIVEN** an admin session and reports in all three statuses
- **WHEN** the flag-queue API is called with the status filter `FOO`, `fixed` or an empty value
- **THEN** each request answers 400 with a problem+json body naming the status filter, and returns no reports

### Requirement: Re-evaluation of a reported attempt

Re-evaluating an `OPEN` report SHALL re-check its attached attempt with the
task's current answer spec. Outcomes are ordered unresolved < revealed <
correct on the 2nd attempt < correct on the 1st attempt. If the attached
attempt belongs to the task's first resolution (not a replay) and the new
verdict improves the task's outcome, the outcome SHALL change, the child
SHALL receive the XP difference between the new and the old outcome as a new
award (computed by the gamification rules with the hints used at that
attempt), and the report SHALL become `FIXED` (FR-41, gamification). Re-evaluation
SHALL only ever add XP: if the new verdict would not improve the outcome,
nothing about the task, attempts or XP SHALL change, the report stays `OPEN`,
and the admin is told that nothing changed (decision OQ-20). Only the
attached attempt is re-checked.

If the re-evaluation resolves the last unresolved task of a mission that was
never completed before, the mission SHALL become complete and its completion
bonus (gamification, once per mission, decision OQ-4) SHALL be awarded in the same
re-evaluation; this applies to every mission containing the task that becomes
complete. No mission-complete screen is shown because the child is not
practising; HQ shows the mission as complete, and a rank-up caused by the
re-evaluation is celebrated the next time the child opens HQ (see
gamification).

A report whose attached attempt is a replay attempt SHALL never change the
task's first-resolution outcome, the first-try rate, mission completion or
XP, because replay attempts earn nothing (practice-flow, decision OQ-17). If the new
verdict is better than the attempt's recorded verdict, it is recorded
alongside the original, the report becomes `FIXED`, and 0 XP is awarded;
otherwise nothing changes and the report stays `OPEN`.

#### Scenario: Re-evaluation awards the missing XP

- **GIVEN** the answer spec wrongly expected `0.05`, the child's attempts 1 and 2 were both `0,5` and marked `WRONG`, the task was revealed and earned 1 XP with no hints, and her report after the reveal carries attempt 2
- **WHEN** the admin corrects the expected value to `0.5` and re-evaluates the report
- **THEN** attempt 2 is re-evaluated as `CORRECT`, the task's outcome becomes correct on the 2nd attempt, a new award of +4 XP (5 − 1) is added, and the report becomes `FIXED`

#### Scenario: Re-evaluation resolves a task still in progress

- **GIVEN** the child's attempt 1 was wrongly marked `WRONG`, she reported it with 1 attempt left and no hints opened, the task's mission still has other unresolved tasks, and the admin fixed the answer spec
- **WHEN** the admin re-evaluates the report
- **THEN** the task becomes correct on the 1st attempt and counts as a first try in its topic's first-try rate, a new award of +10 XP is added, the report becomes `FIXED`, and the child is no longer asked to answer that task in the mission

#### Scenario: Re-evaluation completes a mission

- **GIVEN** the default XP configuration, a mission never completed before with 9 of 10 tasks resolved, and its 10th task in progress after attempt 1 was wrongly marked `WRONG` with no hints opened and reported
- **WHEN** the admin fixes the answer spec and re-evaluates the report
- **THEN** 30 XP is added (10 for the task plus the 20 XP completion bonus), the report becomes `FIXED`, and when the child next opens HQ the mission shows 10/10 vyřešeno and state complete and no mission-complete screen is shown

#### Scenario: Rank-up from a re-evaluation

- **GIVEN** the placeholder rank ladder, a total of 145 XP, and an `OPEN` report whose re-evaluation will add +10 XP
- **WHEN** the admin re-evaluates the report and the child then opens HQ
- **THEN** HQ shows the 2nd rank and the rank-up celebration naming the 2nd rank plays once

#### Scenario: Re-evaluating a replay attempt awards nothing

- **GIVEN** a task whose first resolution was a reveal earning 1 XP, and a report attached to a replay attempt `0,5` marked `WRONG` against a wrong answer key
- **WHEN** the admin fixes the answer spec and re-evaluates the report
- **THEN** the replay attempt shows the re-evaluated verdict `CORRECT` alongside `WRONG`, the report becomes `FIXED`, 0 XP is awarded, and the task's first-resolution outcome stays revealed with the topic's first-try rate unchanged

#### Scenario: The child sees the added XP

- **GIVEN** a report was re-evaluated and +4 XP was added
- **WHEN** the child next opens HQ
- **THEN** her total XP is 4 higher than before the re-evaluation

#### Scenario: Re-evaluation never lowers XP

- **GIVEN** an attempt that was marked `CORRECT` and earned 10 XP, attached to an `OPEN` report
- **WHEN** the admin changes the spec so that the attempt would now be `WRONG` and re-evaluates
- **THEN** the recorded outcome and the child's XP stay as they were, the admin is shown that nothing changed (the API reports `changed: false` and `xpAwarded: 0`), and the report stays `OPEN`

#### Scenario: Unchanged spec changes nothing

- **GIVEN** an `OPEN` report whose task's answer spec has not been edited
- **WHEN** the admin re-evaluates it
- **THEN** no XP is awarded, the task state is unchanged, and the report stays `OPEN`

#### Scenario: Attempt is unparseable under the new spec

- **GIVEN** an `OPEN` report with raw input `abc` and an answer spec the admin changed from short text to a number
- **WHEN** the admin re-evaluates it
- **THEN** it is reported as no change, no XP is awarded, and nothing is stored in place of the original verdict

#### Scenario: Re-evaluating twice awards XP once

- **GIVEN** a report that is already `FIXED`
- **WHEN** the admin calls re-evaluate on it again
- **THEN** the API answers 409 with a problem+json body and no XP is awarded

#### Scenario: Re-evaluating a dismissed report

- **GIVEN** a `DISMISSED` report whose attached attempt would now be `CORRECT` under the current answer spec
- **WHEN** re-evaluate is called on it
- **THEN** the API answers 409 with a problem+json body, no XP is awarded, and the report stays `DISMISSED`

#### Scenario: Re-evaluating a report without an attempt

- **GIVEN** an `OPEN` report with no attempt attached
- **WHEN** re-evaluate is called on it through the API
- **THEN** the API answers 409 with a problem+json body and nothing changes

### Requirement: Dismissing a report

Dismissing an `OPEN` report SHALL set it to `DISMISSED` and SHALL change
nothing about the task, its attempts or the child's XP (FR-41). A report
that is already `FIXED` or `DISMISSED` SHALL NOT be dismissed again.

#### Scenario: Dismiss

- **GIVEN** an `OPEN` report
- **WHEN** the admin dismisses it
- **THEN** it becomes `DISMISSED`, and the task, its attempts and the child's XP are unchanged

#### Scenario: Dismissing a dismissed report

- **GIVEN** a `DISMISSED` report
- **WHEN** dismiss is called on it again
- **THEN** the API answers 409 with a problem+json body and the report is unchanged

#### Scenario: Dismissing a fixed report

- **GIVEN** a `FIXED` report whose re-evaluation added +4 XP
- **WHEN** dismiss is called on it
- **THEN** the API answers 409 with a problem+json body, the report stays `FIXED`, and the +4 XP award is kept

### Requirement: Report id handling

Re-evaluate and dismiss SHALL identify a report by its id, a UUID. An id
that is not a UUID SHALL be refused with 400 before any lookup; a
well-formed UUID that matches no report SHALL answer 404 (FR-41).

#### Scenario: Unknown report

- **GIVEN** an admin session
- **WHEN** re-evaluate or dismiss is called with a well-formed UUID that matches no report
- **THEN** the API answers 404 with a problem+json body

#### Scenario: Malformed report id

- **GIVEN** an admin session
- **WHEN** re-evaluate or dismiss is called with the report id `123`, `abc` or a 5,000-character string
- **THEN** the API answers 400 with a problem+json body naming the report id, and no report, task or XP changes

### Requirement: Stats and flag queue are admin-only

The stats page, the flag queue and the attempt log SHALL be reachable only
with an authenticated admin session (see admin-access, FR-40, FR-41, FR-42);
the child never sees them. The state-changing calls (re-evaluate, dismiss)
SHALL also require a valid CSRF token. Authorization SHALL be checked before
input validation, so an unauthenticated call answers 401 even when its input
is invalid.

#### Scenario: Stats without a session

- **GIVEN** no admin session
- **WHEN** the stats API or the flag-queue API is called
- **THEN** it answers 401 and returns no statistics, reports or attempts

#### Scenario: Invalid input without a session

- **GIVEN** no admin session
- **WHEN** the stats API is asked for `abc` weeks
- **THEN** it answers 401, not 400

#### Scenario: Re-evaluation without a session

- **GIVEN** no admin session and an `OPEN` report
- **WHEN** re-evaluate is called on it
- **THEN** it answers 401, no XP is awarded and the report stays `OPEN`

#### Scenario: Re-evaluation without a CSRF token

- **GIVEN** a valid admin session and an `OPEN` report
- **WHEN** re-evaluate is called without a valid CSRF token
- **THEN** it answers 403, no XP is awarded and the report stays `OPEN`

#### Scenario: Dismiss without a session

- **GIVEN** no admin session and an `OPEN` report
- **WHEN** dismiss is called on it
- **THEN** it answers 401 and the report stays `OPEN`

#### Scenario: Dismiss without a CSRF token

- **GIVEN** a valid admin session and an `OPEN` report
- **WHEN** dismiss is called without a valid CSRF token
- **THEN** it answers 403 and the report stays `OPEN`

#### Scenario: Child UI has no stats

- **GIVEN** any child screen
- **WHEN** it is rendered
- **THEN** it offers no link to the stats page or the flag queue

## Explicit exclusions (MVP)

- No export (CSV/PDF), no charts beyond the listed figures, no per-day
  calendar, no custom date ranges beyond the week count (1–52).
- No "pending" state for the success metric; too little history means not
  met.
- No admin view of the attempt log outside the flag queue.
- No notifications to the admin; the queue is checked on the page.
- No bulk re-evaluation of all past attempts after a spec edit; only the
  attempt attached to a report is ever re-checked.
- Re-evaluation never removes or lowers XP and never reverts a verdict that
  was correct. Re-evaluating a replay attempt never awards XP or a mission
  bonus.
- Exact admin-UI copy (empty states, "no change" messages, how a short week
  is highlighted) is a frontend design choice, not an acceptance criterion.
- `GRAPHIC` tasks are never served in MVP, so they never appear in the
  attempt log, the stats or the flag queue.
- Unparseable submissions are not attempts and appear nowhere in the stats.
- Difficulty is not used in any statistic.
- No child-facing statistics; the child sees only HQ progress (see
  gamification).
