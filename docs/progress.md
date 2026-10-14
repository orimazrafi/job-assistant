# Progress

## Current focus
Learning workflow (branch `chore/learning-workflow`, in review). Then auth slice A, card 001-03, starting with its decision brief. Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- Learning workflow: `mentor` skill and `learning.mdc` rule. Each card gets a decision brief before coding, and a code tour plus interview quiz after the merge. ADRs gain an "Interview angle" (backfilled for 001-006), task cards gain a **Decisions** field, and a notebook lives in `docs/learning/` (topic map, auth and sessions, concurrency and atomicity).
- 001-02 ([PR #4](https://github.com/orimazrafi/job-assistant/pull/4)): Redis sessions (7 days idle, 30 days total), `__Host-sid` cookie, `SessionGuard`, `@CurrentUser()`, `GET /api/auth/me`.
- 001-01: `users` table (SQL migration), `UsersRepository`, `pnpm db:migrate`; emails case-insensitive, enforced by the database.
- Review at the PR merge; `main` is protected by the shell hook and the GitHub ruleset "Protect main".
- Tests: 32 unit (API 23), 8 hook-rule groups, 21 integration.

## Decisions made
- The user wants to learn the why and the alternatives of every decision, for system design interviews: see `.cursor/rules/learning.mdc`.
- Session lifetimes kept as in the spec: 7 days idle, 30 days total.
- ADRs: [001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [002](adr/002-bullmq-on-redis.md) BullMQ, [003](adr/003-server-side-sessions.md) sessions, [004](adr/004-free-sources-and-ai.md) free sources/AI, [005](adr/005-toolchain.md) toolchain, [006](adr/006-migrations-node-pg-migrate.md) migrations.

## Open issues
- CI's E2E job does not run `pnpm db:migrate` yet. Needed in card 001-04, when the browser E2E test signs up a user (CI change needs the user's approval). Card 001-03's own tests migrate by themselves.
- Password hashing for 001-03: argon2 needs a native add-on, which `pnpm-workspace.yaml` (`allowBuilds`) currently denies; part of the decision brief.
- The `Secure` session cookie works on `http://localhost` in Chromium and Firefox; check the E2E browser setup in card 001-04.
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-03: decision brief (hashing, validation, enumeration and timing), then sign-up / login / logout endpoints.
2. 001-04: login UI and E2E journey (add `pnpm db:migrate` to CI's E2E job).
3. 001-05: logout of all devices.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [x] Learning workflow (briefs, tours, quizzes, notebook)
- [ ] Auth (001-01, 001-02 done)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
