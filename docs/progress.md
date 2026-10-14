# Progress

## Current focus
Card 001-03 (sign-up, login, logout API) on branch `card/001-03`, in review. Next: 001-04 (login UI and E2E journey). Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- 001-03: `POST /api/auth/signup` (201, or 409 for a taken email), `POST /api/auth/login` (200, or the same 401 for every bad credential, with a dummy hash for equal timing), `POST /api/auth/logout` (always 204). argon2id via `@node-rs/argon2`; a new session id on every sign-in; `ZodValidationPipe` for request bodies. Notes: `docs/learning/password-storage.md`.
- 000-06 ([PR #6](https://github.com/orimazrafi/job-assistant/pull/6)): Bull Board queue dashboard at `/api/queues` (opt-in flag, never in production).
- Learning workflow ([PR #5](https://github.com/orimazrafi/job-assistant/pull/5)): decision briefs, code tours, quizzes, ADR "Interview angle", notebook in `docs/learning/` with a 9-lesson catch-up path. Lesson 1 (system shape) done.
- Tests: 61 unit (API 52), 8 hook-rule groups, 32 integration.

## Decisions made
- [ADR 007](adr/007-password-hashing-argon2id.md): argon2id (m=19456, t=2, p=1) with `@node-rs/argon2` (prebuilt binaries, no install script to allow).
- [ADR 008](adr/008-request-validation-zod-pipe.md): zod schemas in a small Nest pipe, checked against shared types with `satisfies`.
- Sign-up returns 409 for a taken email (accepted enumeration trade-off; login never reveals it). Rate limits in 001-06 reduce harvesting.
- Earlier: ADRs [001](adr/001-postgres-plus-mongodb.md)–[006](adr/006-migrations-node-pg-migrate.md); queue dashboard is a fail-closed flag; the user wants the why and alternatives of every decision (`.cursor/rules/learning.mdc`).

## Open issues
- Job payloads are trusted with `as` casts in the worker (`system.processor.ts`); job fetching should validate them with zod (the pipe pattern from ADR 008 fits).
- CI's E2E job does not run `pnpm db:migrate` yet. Needed in card 001-04, when the browser E2E test signs up a user (CI change needs the user's approval).
- Login and sign-up hash on every request (about 20–100 ms CPU depending on the machine, and 19 MiB each) and have no rate limit until 001-06.
- The `Secure` session cookie works on `http://localhost` in Chromium and Firefox; check the E2E browser setup in card 001-04. curl does not store Secure cookies over http, so pass the cookie header by hand.
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-04: login UI and E2E journey (add `pnpm db:migrate` to CI's E2E job).
2. 001-05: logout everywhere (`user-sessions:<userId>` set).
3. Learning: lesson 2 (data stores) whenever the user asks.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI (+ queue dashboard)
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [x] Learning workflow (briefs, tours, quizzes, notebook)
- [ ] Auth (001-01 to 001-03 done)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
