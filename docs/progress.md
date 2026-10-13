# Progress

## Current focus
Auth slice A (email account). Card 001-01 is merged ([PR #2](https://github.com/orimazrafi/job-assistant/pull/2)). Next: 001-02. Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- 001-01: `users` table (SQL migration), `UsersRepository` (findByEmail, findById, create), `pnpm db:migrate`. Emails are stored trimmed and lowercase; the database enforces it, so duplicate emails are rejected in any case (`EmailTakenError`, 409).
- Review at the PR merge ([PR #3](https://github.com/orimazrafi/job-assistant/pull/3)): the agent commits, pushes card branches, and opens PRs without asking; only the user merges.
- `main` is protected twice: the shell hook (blocks commits/merges/pushes on or to `main`, `--all`/`--mirror`, branch switches chained with commits or pushes, `gh pr merge`) and the GitHub ruleset "Protect main" (PR required, all 3 CI checks must pass, no force push or deletion, no bypass).
- Tests: 20 unit, 8 hook-rule groups, 10 integration.

## Decisions made
- Migrations: node-pg-migrate with plain SQL files, run as an explicit step, not on API startup — [ADR 006](adr/006-migrations-node-pg-migrate.md)
- Earlier: [ADR 001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [ADR 002](adr/002-bullmq-on-redis.md) BullMQ, [ADR 003](adr/003-server-side-sessions.md) sessions, [ADR 004](adr/004-free-sources-and-ai.md) free sources/AI, [ADR 005](adr/005-toolchain.md) toolchain.

## Open issues
- Session length is undecided for 001-02: keep 7 days idle / 30 days total, or add a "Remember me" checkbox.
- CI's E2E job does not run `pnpm db:migrate` yet. Needed before card 001-03 uses the table from the app (CI change needs the user's approval).
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- pnpm 12 requires explicit build-script approval; optional native add-ons are denied in `pnpm-workspace.yaml` (`allowBuilds`).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-02: Redis session store, cookie, guard, `GET /api/auth/me`.
2. 001-03: sign-up / login / logout endpoints (add `pnpm db:migrate` to CI's E2E job).
3. 001-04: login UI and E2E journey.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [ ] Auth (001-01 done)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
