# Progress

## Current focus
Card 000-06 (queue dashboard) on branch `card/000-06`, in review. Next: auth card 001-03, starting with its decision brief. Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- 000-06: Bull Board queue dashboard at `/api/queues` (opt-in flag, never in production), wired with `@bull-board/nestjs`; each module registers its own queues via `QueueDashboardModule.forQueue(name)`. Lesson notes: `docs/learning/feature-flags.md`, `docs/learning/nestjs-building-blocks.md`.
- Learning workflow ([PR #5](https://github.com/orimazrafi/job-assistant/pull/5)): decision briefs before coding, code tours and quizzes after merges, ADR "Interview angle", notebook in `docs/learning/` with a 9-lesson catch-up path. Lesson 1 (system shape) done.
- 001-02 ([PR #4](https://github.com/orimazrafi/job-assistant/pull/4)): Redis sessions (7 days idle, 30 days total), `__Host-sid` cookie, `SessionGuard`, `GET /api/auth/me`.
- Tests: 38 unit (API 29), 8 hook-rule groups, 24 integration.

## Decisions made
- Queue dashboard: fail-closed feature flag. On only with `QUEUE_DASHBOARD_ENABLED=true` and never in production (it can retry and delete jobs and has no login yet); move behind login with an admin check once auth exists. Existing local `.env` files need the flag added by hand.
- The user wants to learn the why and the alternatives of every decision: see `.cursor/rules/learning.mdc`.
- ADRs: [001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [002](adr/002-bullmq-on-redis.md) BullMQ, [003](adr/003-server-side-sessions.md) sessions, [004](adr/004-free-sources-and-ai.md) free sources/AI, [005](adr/005-toolchain.md) toolchain, [006](adr/006-migrations-node-pg-migrate.md) migrations.

## Open issues
- Job payloads are trusted with `as` casts in the worker (`system.processor.ts`); real jobs (job fetching) should validate payloads with zod. Add to the job-fetching cards' Decisions.
- CI's E2E job does not run `pnpm db:migrate` yet. Needed in card 001-04, when the browser E2E test signs up a user (CI change needs the user's approval).
- Password hashing for 001-03: argon2 needs a native add-on, which `pnpm-workspace.yaml` (`allowBuilds`) currently denies; part of the decision brief.
- The `Secure` session cookie works on `http://localhost` in Chromium and Firefox; check the E2E browser setup in card 001-04.
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-03: decision brief (hashing, validation, enumeration and timing), then sign-up / login / logout endpoints.
2. 001-04: login UI and E2E journey (add `pnpm db:migrate` to CI's E2E job).
3. Learning: lesson 2 (data stores) whenever the user asks.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI (+ queue dashboard)
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [x] Learning workflow (briefs, tours, quizzes, notebook)
- [ ] Auth (001-01, 001-02 done)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
