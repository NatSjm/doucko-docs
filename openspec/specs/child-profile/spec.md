# Child Profile Specification

## Purpose

MVP has exactly one learner and no child login. A single profile holds her
display name, her practice settings and her progress. The settings already
carry the switches later phases need (a secondary task language, an answer
mode) so that those phases add behavior instead of changing the data the
child already has.

## Requirements

### Requirement: Single hardcoded profile

The backend SHALL hold exactly one child profile, which every child-facing
request uses without authentication. Its display name SHALL be set once from
an environment variable at first start and stored only in the local
database; it SHALL never appear in a repository, fixture, log, screenshot or
recording (decision OQ-22, NFR-3).

#### Scenario: Display name from the environment

- **GIVEN** an empty database and the display-name environment variable set
- **WHEN** the backend starts for the first time
- **THEN** the profile is created with that display name and HQ greets the child by it

#### Scenario: Later starts keep the profile

- **GIVEN** a profile already exists with progress
- **WHEN** the backend restarts with a different display-name value
- **THEN** the existing profile and its progress are kept unchanged

#### Scenario: Name is not logged

- **WHEN** the backend starts and serves HQ
- **THEN** no log line contains the display name

### Requirement: Profile settings

The profile SHALL store the settings `secondaryTaskLocale` (`uk` or none)
and `answerMode` (FR-43). `answerMode` SHALL have the values `DIRECT` and
`GUIDED` in the API; in MVP only `DIRECT` is accepted and `GUIDED` is
refused. The translation toggle of the practice flow SHALL be persisted in
`secondaryTaskLocale`.

#### Scenario: Turn the Ukrainian text on

- **WHEN** the child turns on "Zobrazit ukrajinsky"
- **THEN** the profile's `secondaryTaskLocale` becomes `uk`
- **WHEN** she turns it off
- **THEN** `secondaryTaskLocale` becomes none

#### Scenario: Guided mode is not available yet

- **WHEN** a request sets `answerMode` to `GUIDED`
- **THEN** it is refused with a "not available yet" error and `answerMode` stays `DIRECT`

#### Scenario: Unsupported locale

- **WHEN** a request sets `secondaryTaskLocale` to `ru`
- **THEN** it is refused with an error listing the supported task locales

## Explicit exclusions (MVP)

- No child login, no second child, no parent accounts.
- No settings screen beyond the translation toggle; the admin does not edit
  the profile in MVP.
