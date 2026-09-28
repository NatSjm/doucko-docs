# ADR-0003: Spring Boot 4.1 instead of 3.x, plus the scaffold toolchain

- **Status:** Accepted (amends TC-1 and the version in ADR-0001)
- **Date:** 2026-09-28
- **Deciders:** product owner (parent) + orchestrator

## Context

TC-1 fixed "Spring Boot 3.x". By the time the apps were scaffolded
(PLAYBOOK Phase 0 step 4, 2026-09-28), Spring Boot 3.5, the last 3.x
line, had left free (OSS) support in June 2026. Spring Initializr offers
only 4.0.x, 4.1.x and 4.2 milestones. The app runs for a child on a home
LAN (NFR-2, NFR-3), so it needs security patches without a support
contract. Scaffolding also forced a few frontend tooling choices that the
PRD left open ("e.g. orval or openapi-typescript", §11).

## Decision

**Backend**
- Spring Boot **4.1.x** (4.1.1 at scaffold), Kotlin 2.3, JVM 21, Maven
  wrapper, Spring Modulith 2.1. TC-1 now reads "Spring Boot 4.x".
- Boot 4 brings Jackson 3 (`tools.jackson.*`) and Testcontainers 2. The
  openapi generator (`kotlin-spring`, `interfaceOnly`) runs with
  `useSpringBoot4=true`, which also selects Jackson 3.
- Generated interfaces and models live in `cz.doucko.api` (+ `.model`),
  declared as an OPEN Spring Modulith module (`ApiModule.kt`), so every
  feature module may implement and use them.
- The Modulith JPA event-publication registry (`spring-modulith-starter-jpa`)
  is **not** included yet. Add it, together with its Flyway migration, when
  the first slice needs durable cross-module events.

**Frontend**
- TS client: **openapi-typescript** (types only, generated into gitignored
  `src/api/generated/`) + **openapi-fetch** + **openapi-react-query** over
  TanStack Query.
- **TypeScript 5.9**, not the 6.0 of the current Vite template:
  openapi-typescript 7 declares `typescript ^5`.
- **ESLint** (flat config), not the template's oxlint: the harness hooks
  and pre-commit call `eslint`.

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **Boot 4.1 (chosen)** | current, free patches, Initializr-supported | contradicts the TC-1 text (amended here); Jackson 3 migration notes apply to all code |
| Boot 3.5 (TC-1 as written) | matches the PRD literally | no free security patches; hand-written pom; a Boot 4 migration becomes mandatory later |
| Boot 4.0 | the older 4.x line | shorter remaining support than 4.1 for no gain |
| orval / hey-api client | generates the React Query hooks themselves | more generated runtime code; hey-api is pre-1.0 |

## Consequences

- Examples written for Spring Boot 3 or Jackson 2 (`com.fasterxml.jackson.databind`)
  often do not apply. Read the Boot 4 and Jackson 3 docs first
  (AGENTS.md already warns about this).
- Until `api/openapi.yaml` exists (Phase 2), both generators skip visibly:
  Maven logs "Code generation is skipped" (profile `no-sibling-contract`);
  `npm run api:generate` prints `SKIP-pending`. Once `contract/` is pinned,
  generation reads only the pin (profile `pinned-contract`).
- Move to TypeScript 6 when openapi-typescript supports it.
