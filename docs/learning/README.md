# Learning notebook

General concepts and system design interview practice, learned while building this project.
This project's own decisions live in [ADRs](../adr/); notebook entries link to them instead of repeating them.
How entries are written: the `mentor` skill (`.cursor/skills/mentor/SKILL.md`).

## Topic map

Classic system design interview topics, and where each one shows up in this project.

| Topic | Where in this project | Status | Notes |
|---|---|---|---|
| System shape (modular monolith, producer/consumer, shared contracts) | API, worker, and web in one monorepo ([architecture](../architecture.md)) | Built | [system-shape](system-shape.md) |
| Auth and sessions | Redis sessions, cookie, guard ([feature](../features/auth.md)) | Built (SSO planned) | [auth-sessions](auth-sessions.md) |
| Password storage and login safety | argon2id, enumeration and timing, session rotation ([ADR 007](../adr/007-password-hashing-argon2id.md)) | Built | [password-storage](password-storage.md) |
| Input validation | zod schemas in a Nest pipe ([ADR 008](../adr/008-request-validation-zod-pipe.md)) | Built | [password-storage](password-storage.md) |
| Concurrency and atomicity | `SessionStore` (`SET NX` / `XX`), unique constraints | Built | [concurrency-atomicity](concurrency-atomicity.md) |
| Schema migrations | `apps/api/migrations/` ([ADR 006](../adr/006-migrations-node-pg-migrate.md)) | Built | — |
| Queues and background jobs | BullMQ worker ping; job pipeline ([ADR 002](../adr/002-bullmq-on-redis.md)) | Partly built | — |
| Polyglot persistence | Postgres + MongoDB + Redis ([ADR 001](../adr/001-postgres-plus-mongodb.md)) | Built | — |
| Rate limiting | Login limits in Redis (card 001-06) | Planned | — |
| Web security (CSRF, CORS, headers) | Card 001-06 | Planned | — |
| Federated login (OAuth 2.0, OIDC) | Google and LinkedIn sign-in (cards 001-07 to 001-09) | Planned | — |
| External API integration | Job sources ([spec 002](../specs/002-job-fetching.md), [ADR 004](../adr/004-free-sources-and-ai.md)) | Planned | — |
| Deduplication and idempotency | "Seen before?" step in the job pipeline | Planned | — |
| Search and ranking | Relevance scoring against the CV | Planned | — |
| Caching | Redis cache (not used yet) | Planned | — |
| Observability | Health checks; Bull Board queue dashboard at `/api/queues` (opt-in, never in production) | Partly built | — |
| Feature flags and secure defaults | `QUEUE_DASHBOARD_ENABLED` (fail-closed, defense in depth) | Built | [feature-flags](feature-flags.md) |
| Framework: NestJS building blocks | Modules, DI, request lifecycle, dynamic modules, middleware vs guards | Built | [nestjs-building-blocks](nestjs-building-blocks.md) |
| Scaling and replication | Not covered: single-node stores | Not covered | Discuss in "At scale" sections |

When a card touches a topic, its entry is created or updated in the same PR.

## Catch-up path

Decisions made before the learning workflow existed, replayed as lessons (about 20-30 minutes each).
Each lesson: a decision brief as if choosing again (the problem, the options, what we chose and why, and what would change the choice), then a quiz, then a notebook entry.

- [x] 1. **System shape:** API, a separate worker, and web in one monorepo; a walking skeleton first. ([architecture](../architecture.md), [ADR 005](../adr/005-toolchain.md))
- [ ] 2. **Data stores:** Postgres, MongoDB, and Redis, and what each one holds. ([ADR 001](../adr/001-postgres-plus-mongodb.md))
- [ ] 3. **Background jobs:** BullMQ vs RabbitMQ, Kafka, or cron. ([ADR 002](../adr/002-bullmq-on-redis.md))
- [ ] 4. **Sessions vs JWT:** mostly covered in the code tours; quiz only. ([ADR 003](../adr/003-server-side-sessions.md), [notes](auth-sessions.md))
- [ ] 5. **Schema and migrations:** the `users` table (uuid keys, normalized email, unique constraint), migration tool, migrating as a separate step. ([ADR 006](../adr/006-migrations-node-pg-migrate.md))
- [ ] 6. **Toolchain and testing:** ESM, raw drivers vs an ORM, the test pyramid with real databases, validating env at startup. ([ADR 005](../adr/005-toolchain.md))
- [ ] 7. **API design in NestJS:** layers, dependency injection, typed errors with one exception filter, health checks. (no ADR)
- [ ] 8. **Delivery and safety:** the CI pipeline, branch protection, review at the PR, the guardrail hook. (no ADR)
- [ ] 9. **Free sources and AI:** public ATS APIs instead of scraping, the `LlmProvider` abstraction. Best right before job fetching. ([ADR 004](../adr/004-free-sources-and-ai.md))
