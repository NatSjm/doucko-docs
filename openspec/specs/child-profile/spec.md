# Child Profile Specification

## Purpose

MVP has exactly one learner and no child login. A single profile, created by
the backend on first start, holds the child's display name and the child's
practice settings. The settings already carry the switches later phases need
(a secondary task language and an answer mode), so those phases add behavior
instead of migrating data. The display name is private: it lives only in the
local database and never leaves the laptop.

Some rules below are design decisions made in this spec rather than stated by
a requirement row: display-name validation and startup refusal, the
partial-update rules, and the handling of wrong types. They
are labeled "Design decision". HTTP status codes and the problem+json error
shape come from `api/openapi.yaml` (operations `getProfileSettings` and
`updateProfileSettings`). This spec does not redefine them.

## Requirements

### Requirement: Single profile created once at first start

The backend SHALL hold exactly one child profile. Every child-facing request
SHALL use it without any login or profile selection. On the first start
against an empty database, the backend SHALL create the profile with the
display name read from the display-name environment variable. On later
starts the backend SHALL keep the existing profile and SHALL NOT read the
variable (decision OQ-22). There is no API or admin screen for changing the
display name in MVP.

#### Scenario: Profile created from the environment on first start

- **GIVEN** an empty database and the display-name environment variable set to `Hrdinka`
- **WHEN** the backend starts for the first time
- **THEN** exactly one child profile exists, with display name `Hrdinka`
- **AND** the HQ response's `displayName` is `Hrdinka`

#### Scenario: Restart keeps the profile and its progress

- **GIVEN** a profile with display name `Hrdinka`, 120 XP and 14 resolved tasks
- **WHEN** the backend restarts with the display-name variable changed to `Jiné jméno`
- **THEN** exactly one profile still exists, its display name is still `Hrdinka`, and its XP and resolved tasks are unchanged

#### Scenario: Restart without the variable after first start

- **GIVEN** a profile already exists
- **WHEN** the backend restarts with the display-name variable unset, or set to a value that would be refused on first start (e.g. 200 characters)
- **THEN** the backend starts normally and the profile is unchanged

#### Scenario: The contract offers no way to create, delete or switch profiles

- **WHEN** `api/openapi.yaml` is inspected
- **THEN** the only operations whose path contains `profile` are `GET /api/child/profile/settings` and `PATCH /api/child/profile/settings`
- **AND** no operation under `/api/child/**` or `/api/admin/**` creates, deletes, lists or selects a child profile

#### Scenario: Profile count stays 1 after the end-to-end suite

- **GIVEN** a database created by a first start
- **WHEN** the full end-to-end suite has run against it
- **THEN** a direct database query counts exactly 1 child profile

### Requirement: Display name is validated on first start

Design decision: the display name read on first start SHALL be trimmed of
leading and trailing whitespace. The trimmed value SHALL be 1 to 50 Unicode
code points long. It SHALL NOT contain control characters (Unicode category
Cc, e.g. tab, newline, NUL) or the replacement character U+FFFD, which marks
bytes that were not valid UTF-8. If the value breaks any of these rules, the
backend SHALL refuse to start: it exits with a non-zero status, prints a
message naming the variable and the broken rule (without printing the value),
and creates no profile.

#### Scenario: Surrounding whitespace is trimmed

- **GIVEN** an empty database and the display-name variable set to `  Hrdinka  `
- **WHEN** the backend starts for the first time
- **THEN** the stored display name is `Hrdinka`

#### Scenario: Missing or blank name is refused

- **GIVEN** an empty database and the display-name variable unset, empty, or only spaces
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status and a message naming the variable
- **AND** no child profile is created

#### Scenario: Oversized name is refused

- **GIVEN** an empty database and the display-name variable set to 51 characters after trimming
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status, the message names the variable and the 50-character limit, and no child profile is created
- **AND** a 50-character name on a fresh empty database is accepted

#### Scenario: Name with control characters is refused

- **GIVEN** an empty database and the display-name variable containing a newline or tab between two letters
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status and no child profile is created

#### Scenario: Name that is not valid UTF-8 is refused

- **GIVEN** an empty database and the display-name variable containing the byte sequence `0xC3 0x28` (invalid UTF-8)
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status and no child profile is created

### Requirement: Display name stays private

The display name SHALL exist only in the local database and in the local,
uncommitted environment file used to seed it. It SHALL NOT appear in any
committed file, test fixture, log line, screenshot or demo recording (NFR-3).
Fixtures, tests and recordings SHALL use an invented placeholder name. The
display name SHALL NOT be sent anywhere except in the HQ response to the
local frontend.

The repository check SHALL be a privacy scan that reads the real name from
the uncommitted backend environment file at run time. The real name is never
written into the check, its configuration or its output. When the
environment file or the variable is missing, the scan SHALL report
NOT-EARNED and exit non-zero, never PASS.

#### Scenario: Name is not written to logs

- **GIVEN** the display name is `Hrdinka`
- **WHEN** the backend starts for the first time, then serves HQ, accepts one settings change and refuses one invalid settings change
- **THEN** no backend log line, at any level, contains `Hrdinka`

#### Scenario: Startup failure does not echo the value

- **GIVEN** an empty database and the display-name variable set to `Hrdinka` followed by 50 `x` characters
- **WHEN** the backend refuses to start
- **THEN** the printed error names the variable and contains neither `Hrdinka` nor the `x` run

#### Scenario: Privacy scan finds the real name in no tracked file

- **GIVEN** the backend environment file holds the real display name
- **WHEN** the privacy scan runs over the tracked files (`git ls-files`) of the docs, backend and frontend repos
- **THEN** it reports zero case-insensitive matches of that name and exits 0
- **AND** its output does not print the name

#### Scenario: Privacy scan cannot pass without its oracle

- **GIVEN** the backend environment file is absent, or the display-name variable in it is unset
- **WHEN** the privacy scan runs
- **THEN** it reports NOT-EARNED and exits non-zero

#### Scenario: Privacy scan catches a planted name

- **GIVEN** a scratch repository where a tracked fixture contains the name read from the environment file
- **WHEN** the privacy scan runs over it
- **THEN** it exits non-zero and names the offending file path

#### Scenario: Demo recordings are made against a placeholder profile

- **WHEN** a demo recording or evidence screenshot is produced
- **THEN** before the first frame the recording harness reads the HQ response and checks that `displayName` equals the configured placeholder
- **AND** the harness aborts without producing output if `displayName` equals the name in the backend environment file

### Requirement: Profile settings

The profile SHALL store two settings (FR-43):

- `secondaryTaskLocale`: a supported task locale, or none (`null`). In MVP
  the only supported task locale is `uk`.
- `answerMode`: an enum with the values `DIRECT` and `GUIDED`. Both values
  exist in the API contract, but in MVP only `DIRECT` is accepted.

A new profile SHALL start with `secondaryTaskLocale: null` and
`answerMode: "DIRECT"`. The settings endpoints (`GET` and `PATCH
/api/child/profile/settings`) SHALL require no authentication. There is no
child login, and the endpoints act on the single profile. A request without
an admin session cookie or CSRF token SHALL succeed.

Design decision, partial-update semantics of `PATCH`:

- A field that is **omitted** from the body SHALL leave that setting
  unchanged.
- `secondaryTaskLocale: null` (explicit JSON `null`) SHALL clear the locale
  (set it to none).
- `secondaryTaskLocale: ""` is not a way to clear the locale and SHALL be
  refused as a bad request.
- `answerMode` is not nullable: `answerMode: null` SHALL be refused as a bad
  request. It is not a no-op.
- An empty object `{}` SHALL succeed with HTTP 200, change nothing and return
  the current settings.

The practice flow's Ukrainian translation toggle uses these endpoints and is
stored in exactly one place: turning "Zobrazit ukrajinsky" on SHALL set
`secondaryTaskLocale` to `"uk"`, and turning it off SHALL set it to `null`
(FR-43 stores what practice-flow remembers). Its UI behavior, including how a failed
save is shown, belongs to the practice-flow capability.

#### Scenario: Translation toggle maps to the setting

- **GIVEN** `secondaryTaskLocale` is `null`
- **WHEN** the child turns "Zobrazit ukrajinsky" on
- **THEN** a following `GET` returns `secondaryTaskLocale: "uk"`
- **WHEN** the child turns it off again
- **THEN** a following `GET` returns `secondaryTaskLocale: null`

#### Scenario: Defaults of a new profile

- **GIVEN** a profile created on first start
- **WHEN** `GET /api/child/profile/settings` is called
- **THEN** the response is HTTP 200 with `secondaryTaskLocale: null` and `answerMode: "DIRECT"`

#### Scenario: Settings need no authentication

- **GIVEN** no admin session cookie and no CSRF token in the request
- **WHEN** `GET` and then `PATCH /api/child/profile/settings` with `{"secondaryTaskLocale": "uk"}` are called
- **THEN** both responses are HTTP 200 and the PATCH response has `secondaryTaskLocale: "uk"`

#### Scenario: Set and clear the secondary locale

- **GIVEN** `secondaryTaskLocale` is `null`
- **WHEN** `PATCH` is sent with `{"secondaryTaskLocale": "uk"}`
- **THEN** the response is HTTP 200 and a following `GET` returns `secondaryTaskLocale: "uk"`
- **WHEN** `PATCH` is then sent with `{"secondaryTaskLocale": null}`
- **THEN** the response is HTTP 200 and a following `GET` returns `secondaryTaskLocale: null`

#### Scenario: Omitted field means no change

- **GIVEN** `secondaryTaskLocale` is `uk` and `answerMode` is `DIRECT`
- **WHEN** `PATCH` is sent with `{"answerMode": "DIRECT"}`
- **THEN** the response is HTTP 200 and `secondaryTaskLocale` is still `uk`

#### Scenario: Empty object is a successful no-op

- **GIVEN** `secondaryTaskLocale` is `uk` and `answerMode` is `DIRECT`
- **WHEN** `PATCH` is sent with `{}`
- **THEN** the response is HTTP 200 with `secondaryTaskLocale: "uk"` and `answerMode: "DIRECT"`, and nothing is changed

#### Scenario: Setting survives a backend restart

- **GIVEN** `secondaryTaskLocale` is `uk`
- **WHEN** the backend containers restart
- **THEN** `GET /api/child/profile/settings` still returns `secondaryTaskLocale: "uk"`

#### Scenario: Admin API cannot change the profile

- **GIVEN** a valid admin session with its CSRF token, and settings `secondaryTaskLocale: "uk"`, `answerMode: "DIRECT"`
- **WHEN** `PATCH /api/admin/profile/settings` and `PUT /api/admin/profile` are sent with `{"secondaryTaskLocale": null}`
- **THEN** each response is HTTP 404
- **AND** `api/openapi.yaml` lists no operation under `/api/admin/**` whose path contains `profile`
- **AND** a following child `GET` still returns `secondaryTaskLocale: "uk"`

### Requirement: Invalid settings are refused without side effects

A `PATCH` that is invalid SHALL be refused with a problem+json error, using
the status codes from `api/openapi.yaml`. It SHALL leave every stored
setting unchanged, even fields in the same request that were valid on their
own (FR-43).

- `answerMode: "GUIDED"` SHALL be refused as "not available yet" (HTTP 422).
- Bad request (HTTP 400), with `errors` naming each invalid field:
  - a `secondaryTaskLocale` that is not a supported task locale, including
    `""` and strings of any length;
  - an `answerMode` outside the enum, or `null`;
  - a value of the wrong JSON type (number, boolean, object, array);
  - a body that is not valid JSON or is not a JSON object.
- The locale error SHALL list the supported task locales. Error responses
  SHALL NOT echo the submitted value back.
- Validation (HTTP 400) is checked before availability (HTTP 422): a
  request that has a 400-class error and also asks for `GUIDED` is answered
  400 *(design decision)*.

#### Scenario: Validation error wins over GUIDED

- **GIVEN** the stored settings `secondaryTaskLocale: null`, `answerMode: DIRECT`
- **WHEN** a `PATCH` with `{"secondaryTaskLocale": "ru", "answerMode": "GUIDED"}` is sent
- **THEN** it is answered 400 naming `secondaryTaskLocale`, and both settings are unchanged
- An unknown top-level field (e.g. `displayName`, `secondaryLocale`) SHALL
  be ignored: it never changes anything and never makes the request fail.
  This is the one policy for every child request body (admin-access, "Child
  endpoints cannot change content").

#### Scenario: Guided mode is not available yet

- **GIVEN** `answerMode` is `DIRECT`
- **WHEN** `PATCH` sets `answerMode` to `GUIDED`
- **THEN** the response is HTTP 422 problem+json stating that the guided mode is not available yet
- **AND** a following `GET` returns `answerMode: "DIRECT"`

#### Scenario: Guided refusal also discards the locale in the same request

- **GIVEN** `secondaryTaskLocale` is `null`
- **WHEN** one `PATCH` sends `{"secondaryTaskLocale": "uk", "answerMode": "GUIDED"}`
- **THEN** the response is HTTP 422 and a following `GET` returns `secondaryTaskLocale: null`

#### Scenario: Unsupported task locale

- **WHEN** `PATCH` sets `secondaryTaskLocale` to `ru`
- **THEN** the response is HTTP 400 problem+json whose detail lists the supported task locales (`uk`)
- **AND** the stored `secondaryTaskLocale` is unchanged

#### Scenario: Locale is matched exactly

- **WHEN** `PATCH` sets `secondaryTaskLocale` to `UK`, `uk-UA` or ` uk`
- **THEN** each response is HTTP 400 and the stored setting is unchanged

#### Scenario: Empty string does not clear the locale

- **GIVEN** `secondaryTaskLocale` is `uk`
- **WHEN** `PATCH` sends `{"secondaryTaskLocale": ""}`
- **THEN** the response is HTTP 400 problem+json naming `secondaryTaskLocale`
- **AND** a following `GET` returns `secondaryTaskLocale: "uk"`

#### Scenario: Null answer mode is refused

- **GIVEN** `answerMode` is `DIRECT` and `secondaryTaskLocale` is `null`
- **WHEN** `PATCH` sends `{"answerMode": null, "secondaryTaskLocale": "uk"}`
- **THEN** the response is HTTP 400 problem+json naming `answerMode`
- **AND** a following `GET` returns `answerMode: "DIRECT"` and `secondaryTaskLocale: null`

#### Scenario: Unknown answer mode

- **WHEN** `PATCH` sets `answerMode` to `SOCRATIC` or `direct`
- **THEN** the response is HTTP 400 problem+json and the stored `answerMode` is unchanged

#### Scenario: Wrong JSON types

- **WHEN** `PATCH` sends `{"secondaryTaskLocale": 5}`, `{"answerMode": true}`, `{"secondaryTaskLocale": ["uk"]}` or `{"answerMode": {"value": "DIRECT"}}`
- **THEN** each response is HTTP 400 problem+json naming the field, and no setting changes

#### Scenario: Unknown fields are ignored

- **GIVEN** `secondaryTaskLocale` is `null`
- **WHEN** `PATCH` sends `{"secondaryTaskLocale": "uk", "displayName": "Někdo"}`
- **THEN** the response is HTTP 200 with `secondaryTaskLocale: "uk"`
- **AND** the HQ `displayName` is unchanged

#### Scenario: Oversized locale value

- **WHEN** `PATCH` sends `secondaryTaskLocale` as a 10 240-character string
- **THEN** the response is HTTP 400 problem+json naming `secondaryTaskLocale`
- **AND** the response body is shorter than 2 048 bytes and does not contain the submitted string
- **AND** the stored setting is unchanged

#### Scenario: Malformed body

- **WHEN** the `PATCH` body is not valid JSON (e.g. `{"answerMode": `), or is a JSON array or string instead of an object
- **THEN** the response is HTTP 400 problem+json and no setting changes

### Requirement: Supported task locales are not hardcoded

The set of task locales accepted for `secondaryTaskLocale` SHALL be read from
backend configuration, not hardcoded in the settings logic (FR-43, and the
locale seam described in the scope section of `docs/requirements.md`). MVP
ships with `uk` as the only configured value.

#### Scenario: Removing the configured locale makes it refused

- **GIVEN** a test configuration in which the supported task-locale list is empty
- **WHEN** `PATCH` sets `secondaryTaskLocale` to `uk`
- **THEN** the response is HTTP 400 and no settings change, with no code change needed
- **AND** `PATCH` with `{"secondaryTaskLocale": null}` still succeeds

## Explicit exclusions (MVP)

- No child login, no second child, no parent accounts, no profile picker.
  These are Future scope.
- No API, admin screen or settings screen for the display name. The only
  way to set it is the environment variable on first start. Renaming
  requires a fresh database.
- No settings screen for the child. The only child-facing control is the
  "Zobrazit ukrajinsky" toggle in the practice flow, specified by the
  practice-flow capability. The admin does not read or edit the profile in
  MVP.
- `GUIDED` answer mode is part of the contract but is always refused. No
  Guided / Socratic behavior, AI feedback or AI call exists in MVP.
- `answerMode` does not change any MVP behavior. Answer checking, the
  practice flow and feedback behave the same while it is `DIRECT`, and no
  other value can be stored.
- The profile holds no photo, avatar, age, gender, school or any other
  personal data.
- `secondaryTaskLocale` changes only which translation is shown next to the
  Czech text. The UI language stays Czech and is not a profile setting.
