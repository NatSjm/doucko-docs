# Admin Access Specification

## Purpose

Only the parent may change content, read statistics or handle reports. The
admin area therefore sits behind a single password-protected admin account,
while the child's side stays login-free and read-only for content. The whole
stack runs on the home laptop and is reachable from the local network only.

## Requirements

### Requirement: Admin authentication

The admin UI and every admin API operation SHALL require an authenticated
admin session (NFR-1). There SHALL be exactly one admin user; its password
SHALL come from an environment variable and be stored only as a bcrypt hash.

#### Scenario: Unauthenticated admin request

- **WHEN** an admin API operation is called without a valid admin session
- **THEN** it is refused with HTTP 401 and nothing changes

#### Scenario: Wrong password

- **WHEN** someone signs in with a wrong password
- **THEN** sign-in fails with a generic "Invalid credentials" message and no session is created

#### Scenario: Admin UI redirects to sign-in

- **WHEN** the admin UI is opened without a session
- **THEN** the sign-in form is shown instead of the admin page

### Requirement: Child endpoints cannot change content

Child-facing API operations SHALL NOT be able to create, change or delete
sources, tasks, missions, answer specs, hints, translations or images
(NFR-1). They may only record the child's own practice: attempts, opened
hints, problem reports and the profile settings defined by child-profile.

#### Scenario: Child request to an admin operation

- **WHEN** a request without an admin session tries to publish a mission
- **THEN** it is refused with HTTP 401 and the mission is unchanged

### Requirement: Admin session

Admin sign-in SHALL use a form login that creates a session cookie marked
HttpOnly and SameSite=Strict; every admin request that changes data SHALL
require a valid CSRF token; a session SHALL expire after 8 hours without
admin activity (NFR-15). There is no lockout after failed sign-ins, because
the stack is reachable only from the local network.

#### Scenario: Idle timeout

- **GIVEN** an admin session with no activity for 8 hours
- **WHEN** the admin performs any admin action
- **THEN** it is refused with HTTP 401 and the admin must sign in again

#### Scenario: Missing CSRF token

- **GIVEN** a valid admin session
- **WHEN** a data-changing admin request arrives without a valid CSRF token
- **THEN** it is refused with HTTP 403 and nothing changes

### Requirement: Admin password policy

The admin password from the environment SHALL be at least 12 characters;
otherwise the backend SHALL refuse to start and print a clear message that
names the variable but never the value (NFR-16).

#### Scenario: Short password

- **GIVEN** the admin password variable holds 8 characters
- **WHEN** the backend starts
- **THEN** it exits with an error naming the variable and the 12-character minimum

#### Scenario: Missing password

- **GIVEN** the admin password variable is not set
- **WHEN** the backend starts
- **THEN** it exits with an error naming the missing variable

### Requirement: Local network only

The stack SHALL accept connections only on localhost or the home LAN and
SHALL NOT be exposed to the internet in MVP (NFR-2).

#### Scenario: Default binding

- **WHEN** the stack is started with the documented `docker compose up`
- **THEN** its published ports are bound to localhost or a configured LAN address, never to a public interface by default

## Explicit exclusions (MVP)

- No admin user management, password reset, second admin or roles.
- No account lockout, no two-factor sign-in.
- No public hosting.
