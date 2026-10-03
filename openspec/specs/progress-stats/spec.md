# Progress Stats Specification

## Purpose

The admin (parent) needs to know whether practice actually happens and
whether the checker can be trusted. This capability keeps a complete attempt
log, turns it into weekly practice statistics that measure the success
metric ("10 tasks per session, 3 sessions a week, for 4 weeks"), and gives
the admin a queue of the child's problem reports where a wrong answer key
can be fixed and the child's attempt re-evaluated.

## Requirements

### Requirement: Attempt log

Every graded attempt SHALL be stored with the raw input per part, the
normalized input per part, the per-part verdicts, the number of hints used
on the task so far, the attempt number and a timestamp (FR-42). Stored
attempts SHALL never be edited; a re-evaluation is recorded alongside the
original. Unparseable submissions are not attempts and are not stored (see
answer-checking).

#### Scenario: Attempt is logged

- **WHEN** the child submits attempt 1 with a = `12` and b = `0,5`
- **THEN** the log holds raw `12` and `0,5`, normalized `12` and `0.5`, each part's verdict, the hints used, attempt number 1 and the time

### Requirement: Practice statistics

The admin stats page SHALL show, per week (Monday–Sunday, Europe/Prague):
the number of sessions, the number of sessions with at least 10 answered
tasks, the tasks answered per session, the first-try correct rate per topic,
hint usage, and the number of revealed tasks (FR-40). A **session** SHALL be
a run of answered tasks with no gap longer than 30 minutes between
consecutive attempts (decision OQ-14). The page SHALL show whether the
success metric is met: at least 3 qualifying sessions in each of the last 4
weeks.

#### Scenario: Sessions are split by a 30-minute gap

- **GIVEN** the child answered 6 tasks between 16:00 and 16:20, then 5 tasks between 16:40 and 16:55 on the same day
- **THEN** the stats show one session with 11 answered tasks
- **GIVEN** instead the second run started at 16:55, 35 minutes after the last attempt of the first
- **THEN** the stats show two sessions with 6 and 5 answered tasks, neither qualifying

#### Scenario: Week boundary

- **GIVEN** a session on Sunday 23:40 Europe/Prague time
- **THEN** it counts in the week that ends that Sunday, not the following week

#### Scenario: Success metric

- **GIVEN** each of the last 4 weeks has 3 sessions with at least 10 answered tasks
- **THEN** the stats page marks the success metric as met

#### Scenario: No data yet

- **GIVEN** no attempts exist
- **THEN** the stats page shows zeros and a "No practice yet" note, not an error

### Requirement: Flag queue

The admin SHALL see a queue of the child's problem reports, each with the
task, the reason and note, the raw input of the attached attempt and the
checker's verdict for it (FR-41). From a report the admin SHALL be able to
fix the task's answer spec and **re-evaluate** the attached attempt, or
dismiss the report. Reports SHALL have the status `OPEN`, `FIXED` or
`DISMISSED`; the queue shows `OPEN` reports first, oldest first.

#### Scenario: Re-evaluation awards the missing XP

- **GIVEN** the child's attempt 1 `0,5` was marked wrong because the answer spec wrongly expected `0.05`, she then got the task revealed, and she reported "Myslím, že moje odpověď je správně"
- **WHEN** the admin corrects the expected value to `0.5` and re-evaluates
- **THEN** the attempt is now `CORRECT`, the task's outcome becomes correct on the 1st attempt, the child receives the XP difference between the two outcomes as a new award, and the report becomes `FIXED`

#### Scenario: Re-evaluation never lowers XP

- **GIVEN** an attempt that was marked correct
- **WHEN** the admin changes the spec so that the attempt is now wrong and re-evaluates
- **THEN** the recorded outcome and the child's XP stay as they were, and the admin is told that nothing changed

#### Scenario: Dismiss

- **WHEN** the admin dismisses a report
- **THEN** it becomes `DISMISSED` and nothing about the task, attempts or XP changes

#### Scenario: Re-evaluation from the child's side

- **GIVEN** a report was fixed and XP was added
- **WHEN** the child next opens HQ
- **THEN** her total XP includes the added award

## Explicit exclusions (MVP)

- No export, no charts beyond the listed figures, no per-day calendar.
- No notifications to the admin; the queue is checked on the page.
- Stats are admin-only; the child never sees the stats page or the queue.
