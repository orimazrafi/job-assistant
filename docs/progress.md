# Progress

## Current focus
Walking skeleton is done. Next: auth slice A (email account), starting with task 001-01.

## Done this session
- Walking skeleton (spec 000), one commit per card 000-01 … 000-05:
  monorepo + Docker infra, API health check, worker + queue ping, React status page, Playwright smoke + CI workflow.
- Tests: 20 unit (API 11, worker 4, web 5), 2 integration (Testcontainers), 2 E2E — all green.
- Auth task cards reorganized into vertical slices; LinkedIn SSO marked optional.

## Decisions made
- Toolchain: pnpm, ESM, TypeScript 6 (TS 7 not yet supported by typescript-eslint), Vitest, Playwright, raw drivers — [ADR 005](adr/005-toolchain.md)
- Earlier: [ADR 001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [ADR 002](adr/002-bullmq-on-redis.md) BullMQ, [ADR 003](adr/003-server-side-sessions.md) sessions, [ADR 004](adr/004-free-sources-and-ai.md) free sources/AI.

## Open issues
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- CI workflow has not run yet: the repo has no GitHub remote.
- pnpm 12 requires explicit build-script approval; optional native add-ons are denied in `pnpm-workspace.yaml` (`allowBuilds`).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-01: choose migration tool (ADR) + `users` table + repository.
2. 001-02: Redis session store, cookie, guard, `GET /api/auth/me`.
3. 001-03: sign-up / login / logout endpoints.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI
- [ ] Auth
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
