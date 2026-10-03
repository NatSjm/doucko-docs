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
on the 1st attempt, 5 XP for correct on the 2nd attempt, 1 XP when revealed
(FR-34). Each hint opened on that task SHALL reduce the award by 2, but the
award SHALL never go below 1 XP (decision OQ-4). All these values SHALL come
from configuration. A task already resolved before, in any mission, SHALL
earn nothing again (decision OQ-15).

#### Scenario: Award table

- **WHEN** a task is first resolved
- **THEN** the award is:
  - correct on attempt 1, 0 hints → 10 XP
  - correct on attempt 1, 2 hints → 6 XP
  - correct on attempt 1, 5 hints → 1 XP
  - correct on attempt 2, 1 hint → 3 XP
  - correct on attempt 2, 3 hints → 1 XP
  - revealed, 0 or more hints → 1 XP

#### Scenario: Same task in a second mission

- **GIVEN** a task already resolved in mission A
- **WHEN** the child resolves it again in mission B
- **THEN** no XP is awarded for it

#### Scenario: Values are configuration

- **GIVEN** the configuration sets the 1st-attempt award to 12
- **WHEN** a task is first resolved correctly on attempt 1 without hints
- **THEN** 12 XP is awarded, with no code change

### Requirement: Mission completion bonus

Completing a mission for the first time SHALL award a bonus of 20 XP, set in
configuration (FR-35). The bonus SHALL be paid only once per mission; a
replay or a later completion pays nothing (decision OQ-4).

#### Scenario: First completion

- **WHEN** the child resolves the last unresolved task of a mission for the first time
- **THEN** 20 XP bonus is awarded in addition to that task's XP

#### Scenario: No second bonus

- **GIVEN** a mission already completed once
- **WHEN** it is replayed to the end
- **THEN** no bonus is awarded

### Requirement: Ranks and rank-up

Ranks SHALL be an ordered list of rank names with XP thresholds defined in
the skin configuration (FR-36). The child's rank SHALL be the highest rank
whose threshold her total XP has reached. Crossing a threshold SHALL trigger
a rank-up celebration animation. MVP ships a placeholder ladder of five
ranks at 0, 150, 400, 800 and 1500 XP with placeholder original names, to
be renamed with the child later (decisions OQ-1, OQ-4).

#### Scenario: Rank from total XP

- **GIVEN** the placeholder ladder
- **WHEN** the child's total XP is 0, 149, 150, 1499 and 1500
- **THEN** her rank is the 1st, 1st, 2nd, 4th and 5th rank respectively

#### Scenario: Rank-up celebration

- **GIVEN** the child has 145 XP
- **WHEN** a task awards 10 XP
- **THEN** her rank becomes the 2nd rank and the rank-up celebration plays once

#### Scenario: Reduced motion

- **GIVEN** the operating system asks for reduced motion
- **WHEN** a rank-up or a correct-answer celebration happens
- **THEN** it is shown without movement, as a static message and badge (NFR-13)

### Requirement: Progress on HQ

HQ SHALL show the current rank, an XP bar towards the next rank, and the
total number of solved tasks (FR-37). At the top rank the bar SHALL show
that the highest rank is reached.

#### Scenario: XP bar

- **GIVEN** the child has 275 XP under the placeholder ladder
- **WHEN** she opens HQ
- **THEN** HQ shows the 2nd rank and the bar at 125 of 250 XP towards the 3rd rank

#### Scenario: Top rank

- **GIVEN** the child has 1600 XP
- **THEN** HQ shows the 5th rank with a full bar marked as the highest rank

### Requirement: No negative mechanics

XP SHALL never decrease, and the product SHALL have no timers, no streak
penalties and no leaderboards (FR-38). XP SHALL be kept as an append-only
history of awards; no operation, including an admin fix, removes or lowers
an award.

#### Scenario: XP never goes down

- **WHEN** any sequence of attempts, reveals, hint openings, replays or admin re-evaluations happens
- **THEN** the child's total XP after each step is greater than or equal to the total before it

#### Scenario: Wrong answers cost nothing

- **WHEN** an attempt is wrong
- **THEN** no XP is deducted and the copy is encouraging ("Skoro! Zkus to znovu.")

### Requirement: Swappable skin

All theme material — school name, mentor character, rank names, child-facing
copy, illustrations and colours — SHALL come from one skin; replacing the
skin SHALL change how the app looks and reads but not how it behaves
(FR-39). The skin SHALL be original: it uses the hero-academy genre only,
with no names, logos, characters, catchphrases or recognizable art from any
existing manga or anime.

#### Scenario: Swap the skin

- **GIVEN** a second skin with different rank names and colours
- **WHEN** the app is configured to use it
- **THEN** HQ shows the new rank names and colours, and XP, thresholds and the practice flow behave the same

### Requirement: Light and dark theme

The app SHALL follow the operating system's `prefers-color-scheme` with a
light and a dark theme, without an in-app toggle in MVP (FR-58). Both themes
SHALL meet WCAG AA contrast (NFR-13).

#### Scenario: Follows the OS

- **GIVEN** the operating system is set to dark mode
- **WHEN** the child opens HQ
- **THEN** the dark theme is shown

#### Scenario: Contrast in both themes

- **WHEN** the accessibility check runs on HQ and the task screen in light and in dark theme
- **THEN** it reports no WCAG AA contrast violation

## Explicit exclusions (MVP)

- No achievements, cosmetic unlocks, streaks or hero-costume rewards.
- No leaderboards, no comparison with anyone, no timers.
- No XP spending of any kind.
