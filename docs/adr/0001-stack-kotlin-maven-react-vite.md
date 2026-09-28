# ADR-0001: Stack — Kotlin/Spring Boot/Maven backend + React/Vite frontend (swap from the Project Factory default)

- **Status:** Accepted — Spring Boot version amended to 4.x by ADR-0003
- **Date:** 2026-09-28
- **Deciders:** product owner (parent)

## Context

Project Factory defaults to Next.js + Drizzle + Better Auth + Vercel in one
Node repo. The PRD fixes a different stack (TC-1..TC-5, D-19, D-21, D-24):
Kotlin + Spring Boot 3 + JVM 21 + **Maven** + Postgres 16 + Flyway for the
backend; React + Vite + TypeScript (strict) for the frontend; an OpenAPI 3
contract that generates server interfaces and the TS client; Docker Compose
on the home laptop; no cloud. TC-7 requires recording this swap as an ADR
if Factory gates are adopted.

## Decision

We use the PRD stack and map every Factory gate onto it:

| Factory assumption | Doučko mapping |
|---|---|
| `npm run lint/test:run/build` | backend: `node scripts/mvnw.mjs -B verify` (compile, Spotless/ktlint, Surefire unit, Failsafe + Testcontainers IT, Spring Modulith verify, JaCoCo); frontend: `npm run lint/typecheck/test:run/build` |
| per-edit ESLint hook | backend: Spotless (ktlint) on the edited `.kt` file; frontend: ESLint |
| Vitest `coverage-summary.json` | backend: JaCoCo XML (`target/site/jacoco/jacoco.xml`); frontend unchanged |
| `lib/<domain>/` module scope | backend `src/main/kotlin/cz/doucko/<module>/`; frontend `src/features/<domain>/` |
| `*.test.ts` trace annotations | also `*Test.kt` / `*IT.kt` with `// @trace FR-x` |
| real-DB smoke | Testcontainers Postgres 16 (backend); Playwright against `docker compose up` (frontend) |
| deploy + live URL smoke | `docker compose up` on the laptop, LAN-only (NFR-2); `deploy-gated` = verified there |

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **PRD stack (chosen)** | matches the author's skills and the capstone brief; strong typing end to end; contract-first | the Factory's reference scripts assume Node — needed adaptation (ADR-0002) |
| Factory default (Next.js monorepo) | zero adaptation | contradicts TC-1/TC-2/D-24; no Kotlin |
| Gradle instead of Maven | faster incremental builds | D-24 decided Maven |

## Consequences

- Each code repo carries a tiny `package.json` for tooling only (pinned
  OpenSpec CLI, harness scripts); the backend build itself is pure Maven.
- The harness needs Node ≥ 20 in every repo and CI job, plus JDK 21 for the backend.
- Follow-up: scaffold both apps (PLAYBOOK Phase 0 step 4).
