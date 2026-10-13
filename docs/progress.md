# Progress

## Current focus
Auth slice A (email account). Card 001-02 is done on branch `card/001-02`, in review. Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- 001-02: Redis `SessionStore` (create, get, touch, destroy) with 7-day idle and 30-day absolute expiry (env-configurable), `__Host-sid` cookie helpers, `SessionGuard`, `@CurrentUser()`, and `GET /api/auth/me` (200 with the user, or 401 that clears a dead cookie).
- 001-01: `users` table (SQL migration), `UsersRepository`, `pnpm db:migrate`; emails case-insensitive, enforced by the database.
- Review at the PR merge: the agent commits, pushes card branches, and opens PRs; only the user merges. `main` is protected by the shell hook and the GitHub ruleset "Protect main" (PR + 3 CI checks, no force push, no bypass).
- Tests: 32 unit (API 23), 8 hook-rule groups, 21 integration.

## Decisions made
- Session lifetimes kept as in the spec: 7 days idle, 30 days total (user's choice; "Remember me" not needed).
- Migrations: node-pg-migrate with plain SQL files — [ADR 006](adr/006-migrations-node-pg-migrate.md)
- Earlier: [ADR 001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [ADR 002](adr/002-bullmq-on-redis.md) BullMQ, [ADR 003](adr/003-server-side-sessions.md) sessions, [ADR 004](adr/004-free-sources-and-ai.md) free sources/AI, [ADR 005](adr/005-toolchain.md) toolchain.

## Open issues
- CI's E2E job does not run `pnpm db:migrate` yet. Needed in card 001-03, when login reads the table (CI change needs the user's approval).
- The `Secure` session cookie works on `http://localhost` in Chromium and Firefox; check the E2E browser setup in card 001-04.
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- pnpm 12 requires explicit build-script approval; optional native add-ons are denied in `pnpm-workspace.yaml` (`allowBuilds`).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-03: sign-up / login / logout endpoints (argon2id, session rotation; add `pnpm db:migrate` to CI's E2E job).
2. 001-04: login UI and E2E journey.
3. 001-05: logout of all devices.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [ ] Auth (001-01, 001-02 done)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
