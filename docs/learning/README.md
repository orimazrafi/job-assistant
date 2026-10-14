# Learning notebook

General concepts and system design interview practice, learned while building this project.
This project's own decisions live in [ADRs](../adr/); notebook entries link to them instead of repeating them.
How entries are written: the `mentor` skill (`.cursor/skills/mentor/SKILL.md`).

## Topic map

Classic system design interview topics, and where each one shows up in this project.

| Topic | Where in this project | Status | Notes |
|---|---|---|---|
| Auth and sessions | Redis sessions, cookie, guard ([feature](../features/auth.md)) | Built (login in progress) | [auth-sessions](auth-sessions.md) |
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
| Observability | Health checks only | Partly built | — |
| Scaling and replication | Not covered: single-node stores | Not covered | Discuss in "At scale" sections |

When a card touches a topic, its entry is created or updated in the same PR.
