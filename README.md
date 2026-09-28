# Doučko — docs (OpenSpec store `doucko`)

Product contract for **Doučko**, a home math tutor for a Czech grade-6 pupil
(see [docs/prd.md](docs/prd.md)). This repo is an
[OpenSpec store](https://openspec.dev/docs/stores): product requirements,
the capability plan, product-level specs, ADRs and the API contract. The
code lives in two sibling repos that pin this one as their `contract/`
submodule and reference it read-only from OpenSpec:

| Repo | Stack |
|---|---|
| `docs` (this) | OpenSpec store `doucko` + delivery harness source (`factory/`) |
| `backend` | Kotlin · Spring Boot 3 · JVM 21 · Maven · Postgres 16 · Flyway |
| `frontend` | React · Vite · TypeScript (strict) · Doučko design system |

Delivery follows an adapted [Project Factory](https://github.com/koldovsky/project-factory)
loop — start with [factory/README.md](factory/README.md) (setup, workset,
everyday commands), then [factory/PLAYBOOK.md](factory/PLAYBOOK.md) and
[factory/GATES.md](factory/GATES.md).

```bash
npm install            # pins the OpenSpec CLI (1.13.2)
npm run qa:verify      # docs battery
npm run gate:status    # G0–G8
npm run check:workspace  # cross-repo join (needs ../backend, ../frontend)
```

Workbook content (NFR-4) and anything identifying the child (NFR-3) are never
committed here.
