# Gamification Specification

## Purpose

Practice is framed as training at an original hero academy: topics are
powers, missions earn XP, and XP raises the child's hero rank. The game only
ever rewards. Nothing is lost, nothing is timed, and nobody is compared. All
names, copy, images and colours come from one swappable skin, shown in a
light or dark theme that follows the operating system.

## Requirements

### Requirement: XP per task

XP SHALL be awarded once per task, on its first resolution: 10 XP for correct
on the 1st attempt, 5 XP for correct on the 2nd attempt, 1 XP when revealed,
because effort still counts (FR-34). Each hint opened on that task before its
first resolution SHALL reduce the award by 2, but the award SHALL never go
below 1 XP; a revealed task always earns exactly 1 XP (decision OQ-4). All
these values SHALL come from configuration. A task MAY belong to several
missions; it SHALL earn XP only on its first resolution anywhere, and never
again in any mission or replay (decision OQ-15). Input that the answer
checker classifies as `UNPARSEABLE` SHALL neither award nor cost XP.

#### Scenario: Award table

- **GIVEN** the default configuration and a task that has never been resolved
- **WHEN** the task is first resolved with the outcome and hint count below
- **THEN** the award is exactly:
  - correct on attempt 1, 0 hints → 10 XP
  - correct on attempt 1, 2 hints → 6 XP
  - correct on attempt 1, 5 hints → 1 XP
  - correct on attempt 2, 0 hints → 5 XP
  - correct on attempt 2, 1 hint → 3 XP
  - correct on attempt 2, 3 hints → 1 XP
  - revealed, 0 hints → 1 XP
  - revealed, 3 hints → 1 XP

#### Scenario: Wrong attempt awards nothing yet

- **GIVEN** a task that has never been resolved
- **WHEN** the child's 1st attempt is wrong
- **THEN** no XP is awarded and none is deducted, and the task stays unresolved

#### Scenario: UNPARSEABLE input is XP-neutral

- **GIVEN** a task that has never been resolved and a total of 40 XP
- **WHEN** the child submits `5,,2` and the checker returns `UNPARSEABLE`
- **THEN** the total stays 40 XP, and a later correct 1st attempt on that task without hints still earns 10 XP (whether the attempt is consumed is specified by answer-checking)

#### Scenario: Same task in a second mission

- **GIVEN** a task that belongs to missions A and B and was already resolved in mission A
- **WHEN** the child resolves it again in mission B
- **THEN** no XP is awarded for it and the total XP is unchanged

#### Scenario: Hints opened after resolution do not change the award

- **GIVEN** a task already resolved correctly on attempt 1 for 10 XP
- **WHEN** the child opens its hints afterwards, for example during a replay
- **THEN** the original 10 XP award stays and nothing is deducted

#### Scenario: Values are configuration

- **GIVEN** the configuration sets the 1st-attempt award to 12
- **WHEN** a task is first resolved correctly on attempt 1 without hints
- **THEN** 12 XP is awarded, with no code change

### Requirement: XP configuration is validated

Every XP value SHALL be validated when the backend starts (FR-34, FR-35). This
covers each task award, the hint cost, the minimum award and the mission
bonus. Each value SHALL be a plain integer. Task awards, the hint cost and
the mission bonus SHALL be from 0 to 1000. The minimum award SHALL be from 1
to 1000. Strings, decimals and locale-formatted numbers SHALL be invalid.
Every key SHALL be present; a missing key SHALL NOT fall back to a built-in
value (decision OQ-29). If any value is
invalid, the backend SHALL refuse to start, and its error SHALL name the
offending configuration key. No XP is ever computed from an invalid
configuration.

#### Scenario: Negative or out-of-range values are rejected

- **GIVEN** a configuration identical to the default except for one of the following:
  - 1st-attempt award `-1`
  - hint cost `-2`
  - minimum award `0`
  - mission bonus `1001`
  - 1st-attempt award `2147483648`
- **WHEN** the backend starts
- **THEN** it refuses to start, and its error names the key that was changed

#### Scenario: Non-integer and locale-formatted values are rejected

- **GIVEN** a configuration identical to the default except that one XP key holds one of the following:
  - `2.5`
  - the string `"10,5"`
  - the string `"1 500"` (with a space or a no-break space U+00A0)
  - the string `"10"`
  - the string `"deset"`
  - `true`
  - null
- **WHEN** the backend starts
- **THEN** it refuses to start, and its error names that key

#### Scenario: Missing key is rejected

- **GIVEN** a configuration identical to the default except that the mission-bonus key is absent
- **WHEN** the backend starts
- **THEN** it refuses to start, and its error names the missing mission-bonus key, instead of using 20 or any other built-in value

#### Scenario: Boundary values are accepted

- **GIVEN** a configuration identical to the default except that the hint cost is `0`, the mission bonus is `1000`, and the minimum award is `1`
- **WHEN** the backend starts
- **THEN** it starts, and a task resolved correctly on attempt 1 after 3 hints earns 10 XP

### Requirement: XP is granted only by the server

XP SHALL be granted only by the backend. It is granted in two cases: when the
backend resolves a task from its own check of a submitted attempt, or when it
completes a mission (FR-34, FR-35). It is also granted by an authenticated
admin re-evaluation (progress-stats). No API operation SHALL accept an XP amount, a
total, a rank or a solved-task count from a client: no operation writes
them, so a request to a write method on a progress resource (for example
`PUT /api/child/hq`) is refused with a 4xx status. Fields of that kind
inside any other request SHALL be ignored like every unknown field
(admin-access, "Child endpoints cannot change content") and SHALL have no
effect on stored progress. Award integrity and "XP never
decreases" (FR-38) depend on this.

#### Scenario: No write operation for progress

- **GIVEN** a total of 50 XP and 3 solved tasks
- **WHEN** a client sends `PUT`, `POST` or `PATCH` to `/api/child/hq` with a body `{"totalXp": 9999, "rank": {"index": 4}, "solvedTasks": 99}`
- **THEN** the response has a 4xx status, and a following `GET /api/child/hq` still returns `totalXp` 50 and `solvedTasks` 3, with the rank unchanged

#### Scenario: Client-supplied XP fields in an attempt are ignored

- **GIVEN** a task that has never been resolved, a total of 50 XP, and the default configuration
- **WHEN** the child submits a correct 1st attempt without hints whose request body also contains `"xpAwarded": 500, "totalXp": 9999, "rank": 4, "solvedTasks": 99`
- **THEN** the response's `xpAwarded` is 10, and HQ shows a total of 60 XP and a solved count higher by exactly 1

#### Scenario: Re-evaluation requires an admin session

- **GIVEN** a flagged report and a total of 50 XP
- **WHEN** a request without a valid admin session calls `POST /api/admin/reports/{reportId}/reevaluate`
- **THEN** the response status is 401, and the total stays 50 XP

### Requirement: Mission completion bonus

Completing a mission for the first time SHALL award a bonus of 20 XP, set in
configuration (FR-35). A mission is complete when all its tasks are resolved
(decision OQ-13). The bonus SHALL be paid exactly once per mission, on its
first completion. Replaying the mission or completing it again pays nothing
(decisions OQ-4, OQ-17).

Tasks MAY be shared between missions (decision OQ-15). A task counts as
resolved for every mission that contains it, wherever it was resolved.
Completion SHALL be checked on every first resolution of a task, including
a resolution created by an admin re-evaluation (progress-stats). That
resolution SHALL complete every mission that contains the task and has no
other unresolved task, and SHALL pay each of those missions' bonuses in the
same award. A mission that is published when all its tasks are already
resolved is complete at publish time, and its bonus is credited then, with no
task XP (decision OQ-28).

#### Scenario: First completion

- **GIVEN** a mission with 9 of 10 tasks resolved and a total of 100 XP
- **WHEN** the child resolves the 10th task correctly on attempt 1 without hints
- **THEN** the child receives 10 XP for the task plus a 20 XP bonus, for a total of 130 XP

#### Scenario: Completion through a revealed task

- **GIVEN** a mission with 9 of 10 tasks resolved and a total of 100 XP
- **WHEN** the last task is revealed after two wrong attempts
- **THEN** the mission is complete, and the total becomes 121 XP (1 XP for the task plus the 20 XP bonus)

#### Scenario: No second bonus

- **GIVEN** a mission already completed once
- **WHEN** it is replayed to the end
- **THEN** no bonus and no task XP is awarded

#### Scenario: Configured bonus

- **GIVEN** the configuration sets the mission bonus to 30
- **WHEN** a mission is completed for the first time
- **THEN** the bonus awarded is 30 XP

#### Scenario: Shared tasks complete another mission

- **GIVEN** mission A with tasks T1–T10, none of them resolved, and mission B with tasks T1, T2 and T11
- **AND** T11 was already resolved in B, T1 was already resolved in A, and the total is 100 XP
- **WHEN** the child resolves T2 in mission A correctly on attempt 1 without hints
- **THEN** mission B is complete and its 20 XP bonus is paid, mission A is not complete, and the total becomes 130 XP (10 task XP + 20 bonus)
- **AND** when B is opened later it shows as complete, and replaying B to the end awards nothing

#### Scenario: One resolution completes two missions

- **GIVEN** missions A and B each have exactly one unresolved task, the same task T, and a total of 100 XP
- **WHEN** the child resolves T correctly on attempt 1 without hints
- **THEN** both missions are complete, and the total becomes 150 XP (10 task XP + 20 bonus for A + 20 bonus for B)

#### Scenario: Each sharing mission pays its own bonus once

- **GIVEN** missions A and B share tasks, A was completed first and paid its bonus, and B still has unresolved tasks of its own
- **WHEN** the child later resolves B's last unresolved task
- **THEN** B's 20 XP bonus is paid once, and A's bonus is not paid again

#### Scenario: Mission published already complete

- **GIVEN** a total of 100 XP and a new mission C whose tasks were all resolved earlier in other missions
- **WHEN** the admin publishes mission C
- **THEN** C is complete, the total becomes 120 XP (bonus only, no task XP), and unpublishing and republishing C pays nothing further

### Requirement: Rank ladder

Ranks SHALL be an ordered list of rank names with XP thresholds, defined in
the skin configuration (FR-36). The child's rank SHALL be the highest rank
whose threshold the child's total XP has reached. The first rank SHALL have
threshold 0 and thresholds SHALL strictly increase. Each threshold SHALL be a
plain integer from 0 to 1 000 000. Strings, decimals and locale-formatted
numbers are invalid (decision OQ-29). MVP ships
a placeholder ladder of five ranks at 0, 150, 400, 800 and 1500 XP with
placeholder original names, to be co-designed with the child later. These
values are tuned after the first week of use (decisions OQ-1, OQ-4).

#### Scenario: Rank from total XP

- **GIVEN** the placeholder ladder
- **WHEN** the child's total XP is 0, 149, 150, 399, 400, 799, 800, 1499 and 1500
- **THEN** the rank is the 1st, 1st, 2nd, 2nd, 3rd, 3rd, 4th, 4th and 5th rank respectively

#### Scenario: Invalid ladder order is rejected

- **GIVEN** a skin whose first rank threshold is not 0, or whose thresholds are not strictly increasing (for example 0, 400, 150, or 0, 150, 150)
- **WHEN** the app loads that skin
- **THEN** it refuses the skin with an error naming the faulty rank entry, and no rank is computed from it

#### Scenario: Invalid threshold values are rejected

- **GIVEN** a skin identical to the placeholder skin except that the 2nd rank's threshold is one of `150.5`, `"150"`, `"1 500"`, `"1,5"`, `-150`, `1000001`, null, or is absent
- **WHEN** the app loads that skin
- **THEN** it refuses the skin with an error naming the 2nd rank entry, and no rank is computed from it

### Requirement: Rank-up celebration

Crossing one or more rank thresholds SHALL trigger a rank-up celebration
animation that names the new rank (FR-36). The celebration SHALL play once
per rank-up, never repeat on later visits, and SHALL respect
`prefers-reduced-motion` (NFR-13). It plays at the award that crosses the
threshold: on the task's feedback when a task award crosses it mid-mission,
or on the mission-complete screen when the last task's award or the
completion bonus crosses it. A mission-complete screen after a mid-mission
rank-up lists the new rank as a static line and does not play the
animation again. A rank-up caused outside a child session SHALL be
celebrated the next time the child opens HQ. This covers a bonus credited
when a mission is published already complete (OQ-28) and an admin
re-evaluation. A celebration counts as played once the client acknowledges
it. A mission-complete rank-up whose screen was never shown (for example,
the browser was closed first) SHALL play the next time the child opens HQ,
and only then. When one award crosses several thresholds, the celebration
names the highest rank reached.

#### Scenario: Rank-up on a task award

- **GIVEN** the placeholder ladder and a total of 145 XP
- **WHEN** a task awards 10 XP
- **THEN** the rank becomes the 2nd rank and the rank-up celebration naming the 2nd rank plays once

#### Scenario: Bonus crosses two thresholds

- **GIVEN** a skin whose ladder has exactly three ranks, at thresholds 0, 150 and 160 XP
- **AND** a total of 140 XP (1st rank), the default XP configuration, and a mission with 9 of 10 tasks resolved
- **WHEN** the child resolves the 10th task correctly on attempt 1 without hints (10 task XP + 20 XP bonus)
- **THEN** the total becomes 170 XP, the rank becomes the 3rd rank, and exactly one celebration plays; it names the 3rd rank and not the 2nd

#### Scenario: No celebration without a rank-up

- **GIVEN** a total of 160 XP under the placeholder ladder
- **WHEN** a task awards 10 XP
- **THEN** no rank-up celebration plays

#### Scenario: Celebration does not repeat

- **GIVEN** a rank-up celebration has already played for the 2nd rank
- **WHEN** the child reloads the app and opens HQ
- **THEN** the celebration does not play again

#### Scenario: Unshown mission-complete rank-up plays on HQ

- **GIVEN** the last task of a mission crossed the 2nd-rank threshold, and the browser was closed before the mission-complete screen was shown
- **WHEN** the child next opens HQ, and later opens that mission's summary
- **THEN** the celebration naming the 2nd rank plays once on HQ, and the summary shows the rank as a static line only

#### Scenario: Rank-up outside a session

- **GIVEN** the placeholder ladder and a total of 140 XP
- **WHEN** the admin publishes a mission that is already complete (20 XP bonus), and the child then opens HQ
- **THEN** HQ shows the 2nd rank and the celebration naming the 2nd rank plays once

#### Scenario: Reduced motion

- **GIVEN** the operating system asks for reduced motion
- **WHEN** a rank-up celebration happens
- **THEN** it is shown without movement, as a static message and rank badge, with the same text (NFR-13)

### Requirement: Progress on HQ

HQ SHALL show the current rank, an XP bar towards the next rank, and the
total number of solved tasks (FR-37). A task counts as solved when it is
resolved (correct or revealed) and is counted once, even if it belongs to
several missions or was replayed. At the top rank the bar SHALL show that
the highest rank is reached.

#### Scenario: XP bar

- **GIVEN** a total of 275 XP under the placeholder ladder
- **WHEN** the child opens HQ
- **THEN** HQ shows the 2nd rank and the bar at 125 of 250 XP towards the 3rd rank

#### Scenario: Fresh profile

- **GIVEN** a total of 0 XP and no resolved tasks
- **WHEN** the child opens HQ
- **THEN** HQ shows the 1st rank, an empty bar at 0 of 150 XP, and 0 solved tasks

#### Scenario: Top rank

- **GIVEN** a total of 1600 XP under the placeholder ladder
- **WHEN** the child opens HQ
- **THEN** HQ shows the 5th rank with a full bar marked as the highest rank, and no "next rank" target

#### Scenario: Solved tasks counted once

- **GIVEN** 12 distinct resolved tasks, one of which belongs to two missions and one of which was replayed
- **WHEN** the child opens HQ
- **THEN** HQ shows 12 solved tasks

### Requirement: No negative mechanics

XP SHALL never decrease, and the product SHALL have no timers, no streak
penalties and no leaderboards (FR-38). XP SHALL be kept as an append-only
history of awards. No operation removes or lowers an award, including a hint
opening, a reveal, a replay, a content edit or an admin re-evaluation. No
child screen SHALL show a negative XP amount or an XP deduction. The wording
of wrong-answer and reveal feedback is specified by practice-flow and
the skin. This capability owns only the XP effect of that feedback.

#### Scenario: XP never goes down

- **GIVEN** a child with any XP total
- **WHEN** any sequence of attempts, reveals, hint openings, replays, answer-spec edits or admin re-evaluations happens
- **THEN** the total XP after each step is greater than or equal to the total before it

#### Scenario: Wrong answers cost nothing

- **GIVEN** a total of 50 XP and a task on its 1st attempt
- **WHEN** the attempt is wrong
- **THEN** the response's `xpAwarded` is 0, the total stays 50 XP, and the task screen shows no XP amount with a minus sign (`-` or `−`) and no XP change of 0 or less

#### Scenario: Revealed answer still earns XP

- **GIVEN** a task that has never been resolved, on its 2nd attempt, with no hints opened, and a total of 50 XP
- **WHEN** that attempt is wrong and the answer is revealed
- **THEN** the response's `xpAwarded` is 1, the screen shows `+1 XP`, the total becomes 51 XP, and no XP amount with a minus sign is shown

#### Scenario: No timers, streaks or leaderboards

- **GIVEN** any child screen (HQ, mission briefing, task, mission complete)
- **WHEN** it is rendered
- **THEN** it shows no countdown or elapsed-time display, no streak counter or streak warning, and no ranking against other people

#### Scenario: Long break is not punished

- **GIVEN** the child has not opened the app for 14 days
- **WHEN** the child opens HQ
- **THEN** the XP, rank and solved-task count are exactly as they were left

### Requirement: Swappable skin

All theme material SHALL come from one skin: the school name, the mentor
character, rank names and thresholds, child-facing copy, illustrations and
colours. Replacing the skin SHALL change how the app looks and reads, but not
how it behaves (FR-39). MVP ships placeholder original names in the skin, to
be replaced after co-design with the child (decision OQ-1). The skin SHALL be
original: it uses the hero-academy genre only, with no names, logos,
characters, catchphrases or recognizable art from any existing manga or
anime. The checkable part of that rule is the checked-in deny-list
`docs/skin/ip-denylist.txt` in this store. It is amended by appending. The
review of recognizable art is not part of this automated check. Child-facing
copy in every skin is Czech.

#### Scenario: Swap the skin

- **GIVEN** a second skin with different rank names and colours
- **WHEN** the app is configured to use it
- **THEN** HQ shows the new rank names and colours, and XP awards, the practice flow and stored progress behave the same

#### Scenario: No theme text outside the skin

- **GIVEN** the skin's school name and mentor name are changed
- **WHEN** the child visits HQ, a task and the mission-complete screen
- **THEN** only the new names appear and the old names appear nowhere

#### Scenario: No borrowed IP

- **GIVEN** the shipped skin (all its text values, keys and asset file names) and the deny-list `docs/skin/ip-denylist.txt` at the pinned contract version
- **WHEN** every deny-list term is searched for in the skin using the matching rule in the file's header (case-insensitive, whole word or phrase)
- **THEN** no term matches

#### Scenario: Deny-list catches a borrowed term

- **GIVEN** a test skin whose school name is "Akademie Plus Ultra"
- **WHEN** the same deny-list search runs on it
- **THEN** it reports a match for "Plus Ultra" and the check fails

#### Scenario: Incomplete skin is rejected

- **GIVEN** a skin missing a required entry, such as the rank list or the school name
- **WHEN** the app loads it
- **THEN** it refuses the skin with an error naming the missing entry, instead of showing empty or placeholder-key text to the child

### Requirement: Light and dark theme

The app SHALL follow the operating system's `prefers-color-scheme` with a
light and a dark theme, without an in-app toggle in MVP (FR-58, decision
OQ-25). On the child screens named in "Contrast in both themes", both
themes SHALL meet WCAG AA contrast (NFR-13). Contrast on every other screen,
the admin UI included, is owned by the capability plan
(`docs/mvp-capability-plan.md`).

#### Scenario: Follows the OS (dark)

- **GIVEN** the operating system is set to dark mode
- **WHEN** the child opens HQ
- **THEN** the dark theme is shown

#### Scenario: Follows the OS (light)

- **GIVEN** the operating system is set to light mode
- **WHEN** the child opens HQ
- **THEN** the light theme is shown

#### Scenario: No in-app toggle

- **GIVEN** any child or admin screen
- **WHEN** it is rendered
- **THEN** it offers no control to switch between light and dark theme

#### Scenario: Contrast in both themes

- **GIVEN** HQ, the task screen (including the wrong-part and revealed states) and the mission-complete screen
- **WHEN** the accessibility check runs on each in light and in dark theme
- **THEN** it reports no WCAG AA contrast violation

## Explicit exclusions (MVP)

- No achievements, badges beyond the rank badge, cosmetic unlocks or
  hero-costume rewards (Future option).
- No leaderboards, no comparison with anyone, no timers, no streaks.
- No XP spending, no XP decay and no XP deduction of any kind.
- No in-app light/dark toggle; the OS setting is the only switch.
- Replays earn no task XP and no mission bonus; the replay behaviour itself
  belongs to practice flow.
- Graphic-answer tasks are never served in MVP (content authoring), so they
  never earn XP and never count as solved tasks.
- Admin re-evaluation of flagged attempts is specified in progress and
  stats; here it only matters that it can add XP and never remove it.
- Wrong-answer, reveal and format-tip wording (for example the Czech
  encouragement copy) is specified by practice flow, answer checking and the
  skin, not here. Whether an `UNPARSEABLE` submission consumes an attempt is
  specified by answer-checking.
- The final rank names, school name and mentor character are not part of
  MVP acceptance; placeholders are expected.
- Judging whether art is "recognizable" as borrowed IP is a human review, not
  part of the automated deny-list check.
