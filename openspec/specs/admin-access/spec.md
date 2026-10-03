# Admin Access Specification

## Purpose

Only the parent may change content, read statistics or handle reports. The
admin area (`/api/admin/**` and the admin UI) therefore sits behind a single
password-protected admin account with a cookie session, while the child's
side (`/api/child/**`) stays login-free and can never change content. The
whole stack runs on the home laptop and is reachable from the local network
only (binding decision OQ-23).

## Requirements

### Requirement: Admin authentication

Every admin API operation except sign-in, and every admin UI page, SHALL
require an authenticated admin session (NFR-1). There SHALL be exactly one
admin user and no user name: sign-in takes only a password. The password
SHALL come from the environment variable `ADMIN_PASSWORD` and SHALL be held
only as a bcrypt hash — never in plain text in the database, in logs or in
any API response. Error responses SHALL use `application/problem+json`, as
fixed for every operation by the API contract (`api/openapi.yaml`, RFC 9457,
NFR-12). Admin UI copy is English.

#### Scenario: Unauthenticated admin request

- **GIVEN** a client with no admin session cookie
- **WHEN** it calls any `/api/admin/**` operation other than `POST /api/admin/session`
- **THEN** the response is HTTP 401 with an `application/problem+json` body
- **AND** no data is read out or changed

#### Scenario: Successful sign-in

- **GIVEN** the backend started with `ADMIN_PASSWORD` set to `Kocka-na-plote-42`
- **WHEN** `POST /api/admin/session` is called with the JSON body `{"password":"Kocka-na-plote-42"}`
- **THEN** the response is HTTP 204 and sets a session cookie and an `XSRF-TOKEN` cookie
- **AND** a following `GET /api/admin/session` with that session cookie returns HTTP 204

#### Scenario: Wrong passwords are indistinguishable

- **GIVEN** the backend started with `ADMIN_PASSWORD` set to `Kocka-na-plote-42`
- **WHEN** `POST /api/admin/session` is called once with `{"password":"Kocka-na-plote-43"}` and once with `{"password":"x"}`
- **THEN** both responses are HTTP 401 with an `application/problem+json` body whose `title` is `Invalid credentials`
- **AND** the two response bodies are identical apart from any `instance` value
- **AND** neither response sets a session cookie or contains the submitted password

#### Scenario: Sign-in body has no user name

- **GIVEN** the backend started with `ADMIN_PASSWORD` set to `Kocka-na-plote-42`
- **WHEN** `POST /api/admin/session` is called with `{"username":"anything","password":"Kocka-na-plote-42"}`
- **THEN** the response is HTTP 204, because the extra `username` field is ignored and only the password is checked

#### Scenario: Empty, missing or malformed sign-in body

- **WHEN** `POST /api/admin/session` is called with any of: an empty request body, `{}`, `{"password":""}`, `{"password":null}`, or the text `{"password":` (not valid JSON)
- **THEN** each response is HTTP 401 with an `application/problem+json` body whose `title` is `Invalid credentials`
- **AND** no session cookie is set

#### Scenario: Oversized sign-in body

- **GIVEN** the backend is running
- **WHEN** `POST /api/admin/session` is called with a JSON body whose `password` value is 1 MB (1,048,576 ASCII characters) long
- **THEN** the response is HTTP 401 with an `application/problem+json` body and no session cookie is set
- **AND** a following sign-in with the correct password still returns HTTP 204

#### Scenario: Input sharing the first 72 bytes is refused

- **GIVEN** the backend started with `ADMIN_PASSWORD` set to a 72-byte ASCII value P
- **WHEN** `POST /api/admin/session` is called with P followed by `x` (73 bytes)
- **THEN** the response is HTTP 401 and no session cookie is set
- **AND** a sign-in with exactly P returns HTTP 204

#### Scenario: Admin UI shows sign-in without a session

- **GIVEN** a browser with no admin session
- **WHEN** any admin UI page is opened
- **THEN** the English sign-in form (a single password field) is shown instead of the page content

#### Scenario: Password never in plain text

- **GIVEN** the backend has started and a sign-in (successful or failed) has happened
- **WHEN** the database, the backend log and every admin API response are searched for the `ADMIN_PASSWORD` value
- **THEN** the value is found nowhere; only a bcrypt hash (prefix `$2`) is stored, if anything is stored

#### Scenario: Sign-out ends the session

- **GIVEN** a signed-in admin holding the session cookie and the `XSRF-TOKEN` cookie
- **WHEN** `DELETE /api/admin/session` is called with the session cookie and the `XSRF-TOKEN` value in the `X-XSRF-TOKEN` header
- **THEN** the response is HTTP 204
- **AND** a following `GET /api/admin/session` with the old session cookie returns HTTP 401

#### Scenario: Sign-out without a CSRF token is refused

- **GIVEN** a signed-in admin
- **WHEN** `DELETE /api/admin/session` is called with the session cookie but without the `X-XSRF-TOKEN` header
- **THEN** the response is HTTP 403 with an `application/problem+json` body
- **AND** a following `GET /api/admin/session` with the same session cookie still returns HTTP 204

### Requirement: Child endpoints cannot change content

Child-facing API operations (`/api/child/**`) SHALL NOT be able to create,
change or delete sources, tasks, missions, answer specs, hints, translations
or images (NFR-1). They may only record the child's own practice: attempts,
opened hints, problem reports and the profile settings defined by the
child-profile capability. An admin session cookie SHALL NOT be required or
used by child endpoints, and child endpoints SHALL NOT grant access to admin
operations. Fields in a child request body that the contract does not define
SHALL be ignored, not rejected.

#### Scenario: Child client calls an admin operation

- **GIVEN** a client with no admin session (as the child's browser is)
- **WHEN** it calls the operation that publishes a mission (`PUT /api/admin/missions/{missionId}/status` with `{"status":"PUBLISHED"}`)
- **THEN** the response is HTTP 401 and the mission's status is unchanged

#### Scenario: No content-changing child operation exists

- **WHEN** the operations under `/api/child/**` in `api/openapi.yaml` are listed
- **THEN** none of them creates, updates or deletes a source, task, mission, answer spec, hint, translation or image

#### Scenario: Child write is limited to its own practice

- **GIVEN** a published single-part TEXT task (part key `a`) in an active mission, whose Czech prompt is P and whose accepted answer is `12`
- **WHEN** the child submits `POST /api/child/missions/{missionId}/tasks/{taskId}/attempts` with the body `{"answers":{"a":"12"},"prompt":"Změněno","parts":[{"key":"a","label":"a","spec":{"type":"INTEGER","accepted":["99"]}}],"hints":["x"],"status":"DRAFT"}`
- **THEN** the response is HTTP 200 with a `GRADED` result in which part `a` is `CORRECT` (graded against `12`, not `99`)
- **AND** `GET /api/admin/tasks/{taskId}` afterwards returns prompt P, accepted answer `12`, the original hints and status `PUBLISHED`

### Requirement: Admin session cookie and CSRF protection

Admin sign-in SHALL be a password form in the admin UI that the UI submits as
a JSON body (`{"password": ...}`) to `POST /api/admin/session`; this is the
"form login" of NFR-15 — there is no HTML form post and no user-name field.
A successful sign-in SHALL create a session cookie marked HttpOnly and
SameSite=Strict. Every data-changing admin request (POST, PUT, PATCH, DELETE
under `/api/admin/**`, including sign-out `DELETE /api/admin/session`, and
excluding only sign-in `POST /api/admin/session`) SHALL require a valid CSRF
token: the value of the `XSRF-TOKEN` cookie sent back in the `X-XSRF-TOKEN`
header (NFR-15, decision OQ-23).

#### Scenario: Session cookie attributes

- **WHEN** a successful sign-in response is inspected
- **THEN** the session cookie carries the `HttpOnly` attribute and `SameSite=Strict`

#### Scenario: Sign-in needs no CSRF token

- **GIVEN** a client with no cookies at all
- **WHEN** `POST /api/admin/session` is called with the correct password and no `X-XSRF-TOKEN` header
- **THEN** the response is HTTP 204

#### Scenario: Missing CSRF token

- **GIVEN** a valid admin session
- **WHEN** a data-changing admin request (for example `POST /api/admin/tasks` with a valid task) arrives without the `X-XSRF-TOKEN` header
- **THEN** the response is HTTP 403 with an `application/problem+json` body and nothing changes

#### Scenario: Wrong CSRF token

- **GIVEN** a valid admin session
- **WHEN** a data-changing admin request carries an `X-XSRF-TOKEN` value that does not match the session's token
- **THEN** the response is HTTP 403 and nothing changes

#### Scenario: Valid CSRF token

- **GIVEN** a valid admin session
- **WHEN** a data-changing admin request carries the `XSRF-TOKEN` cookie value in the `X-XSRF-TOKEN` header
- **THEN** the request is processed normally

#### Scenario: Reads need no CSRF token

- **GIVEN** a valid admin session
- **WHEN** an admin GET request (for example `GET /api/admin/stats`) is sent without the `X-XSRF-TOKEN` header
- **THEN** it is answered normally

### Requirement: Admin session idle timeout

An admin session SHALL expire after 8 hours without admin activity, measured
on the backend's clock (NFR-15, decision OQ-23). Every request that carries a
valid, unexpired session cookie SHALL reset the idle clock — including a
request refused with HTTP 403 for a missing or wrong CSRF token. A request
refused with HTTP 401 SHALL NOT reset anything and SHALL NOT revive an
expired session. The exact expiry instant is only fixed to within one minute
either side of 8 hours; tests use the 7 h 59 min and 8 h 1 min boundaries.

#### Scenario: Idle timeout just past 8 hours

- **GIVEN** an admin session whose last request was 8 hours 1 minute ago on the backend's clock
- **WHEN** the admin sends any admin request with that session cookie (and a valid CSRF token, for a data-changing one)
- **THEN** it is refused with HTTP 401 and nothing changes
- **AND** the admin UI shows the sign-in form

#### Scenario: Session still valid just before 8 hours

- **GIVEN** an admin session whose last request was 7 hours 59 minutes ago on the backend's clock
- **WHEN** the admin sends `GET /api/admin/session` with that session cookie
- **THEN** the response is HTTP 204

#### Scenario: Activity keeps the session alive

- **GIVEN** an admin session whose last request was 7 hours ago
- **WHEN** the admin makes a request and then another 7 hours later
- **THEN** both requests succeed, because each request reset the idle clock

#### Scenario: A CSRF refusal still counts as activity

- **GIVEN** an admin session whose last request was 7 hours ago
- **WHEN** a data-changing admin request without the `X-XSRF-TOKEN` header is refused with HTTP 403, and 7 hours later `GET /api/admin/session` is sent with the same cookie
- **THEN** the `GET` returns HTTP 204

#### Scenario: Requests after expiry do not revive the session

- **GIVEN** an admin session whose last request was 8 hours 1 minute ago
- **WHEN** `GET /api/admin/session` is sent with that cookie, and is sent again 1 minute later
- **THEN** both responses are HTTP 401

### Requirement: No sign-in lockout

Failed sign-ins SHALL NOT lock the admin account or block the client,
because the stack is reachable only from the local network (NFR-15, NFR-2,
decision OQ-23).

#### Scenario: Correct password after many failures

- **GIVEN** 20 consecutive failed sign-ins
- **WHEN** the correct password is then submitted
- **THEN** sign-in succeeds with HTTP 204

### Requirement: Admin password policy

The `ADMIN_PASSWORD` value SHALL be at least 12 characters, counted as
Unicode code points of the value exactly as given (no normalization), not as
bytes (NFR-16, decision OQ-23). Because bcrypt uses only the first 72 bytes
of its input (NFR-1), the value SHALL also be at most 72 bytes in UTF-8
(decision OQ-30).
Otherwise the backend SHALL refuse to start and print a clear message that
names `ADMIN_PASSWORD` and the violated limit (12-character minimum or 72-byte
maximum) but never the value. Sign-in SHALL compare the full submitted value,
so an input longer than 72 bytes never signs in.

#### Scenario: Short password

- **GIVEN** `ADMIN_PASSWORD` holds 11 ASCII characters
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status before serving any request
- **AND** the message contains `ADMIN_PASSWORD` and the 12-character minimum
- **AND** the message and the log do not contain the password value

#### Scenario: Missing or empty password

- **GIVEN** `ADMIN_PASSWORD` is not set, or is set to the empty string
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status before serving any request and the message contains `ADMIN_PASSWORD`

#### Scenario: Minimum-length password accepted

- **GIVEN** `ADMIN_PASSWORD` holds exactly 12 ASCII characters
- **WHEN** the backend starts
- **THEN** it starts normally and that password signs in successfully

#### Scenario: Non-ASCII characters are counted, not bytes

- **GIVEN** `ADMIN_PASSWORD` is `привет` (6 Cyrillic characters, 12 bytes in UTF-8)
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status and the message contains `ADMIN_PASSWORD` and the 12-character minimum

#### Scenario: Twelve non-ASCII characters accepted

- **GIVEN** `ADMIN_PASSWORD` is `žluťoučkýkůň` (12 characters in NFC form, 18 bytes in UTF-8)
- **WHEN** the backend starts
- **THEN** it starts normally and signing in with `{"password":"žluťoučkýkůň"}` returns HTTP 204

#### Scenario: Password over 72 bytes refused at startup

- **GIVEN** `ADMIN_PASSWORD` holds 73 ASCII characters (73 bytes), or 37 Czech letters with diacritics such as `ž` (74 bytes in UTF-8)
- **WHEN** the backend starts
- **THEN** it exits with a non-zero status before serving any request
- **AND** the message contains `ADMIN_PASSWORD` and the 72-byte maximum, and not the value

#### Scenario: 72-byte password accepted

- **GIVEN** `ADMIN_PASSWORD` holds exactly 72 ASCII characters
- **WHEN** the backend starts
- **THEN** it starts normally and that password signs in successfully

### Requirement: Local network only

The stack SHALL accept connections only on localhost or the home LAN and
SHALL NOT be exposed to the internet in MVP (NFR-2). A "LAN address" here is
an IPv4 address in a private range (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`,
`192.168.0.0/16`); any other address, and the wildcards `0.0.0.0` and `::`,
count as public.

#### Scenario: Default binding is loopback

- **GIVEN** the documented Compose configuration with no overrides
- **WHEN** the stack is started with `docker compose up` and its published ports are listed (`docker compose ps`)
- **THEN** every published port is bound to `127.0.0.1` and to no other address

#### Scenario: Configured LAN address

- **GIVEN** the documented Compose configuration with the bind address overridden to the laptop's RFC 1918 address (for example `192.168.1.20`)
- **WHEN** the stack is started and its published ports are listed
- **THEN** every published port is bound only to `192.168.1.20`, and none to `0.0.0.0`, `::` or a non-RFC 1918 address

#### Scenario: Database not published

- **WHEN** the running stack's published ports are listed
- **THEN** the database port is not published to the host network

## Explicit exclusions (MVP)

- No admin user management, user names, password reset, password change in
  the UI, second admin, or roles; the password changes only by editing
  `ADMIN_PASSWORD` and restarting.
- No account lockout, rate limiting, CAPTCHA or two-factor sign-in
  (LAN only, NFR-2).
- No child login or child authentication; the child profile is a single
  hardcoded profile (child-profile capability).
- No public hosting, TLS termination or reverse-proxy setup; no IPv6 LAN
  binding.
- No "remember me" sessions beyond the 8-hour idle window.
- This capability owns no FR; the admin features behind the session
  (content-authoring, progress-stats) are specified in their own
  capabilities.

## Notes (non-normative)

- UX suggestion, not a requirement and not tested: after signing in, the
  admin UI may return to the admin page that was originally requested. No
  FR/NFR or OQ asks for it.
