# Progress

## Current focus
Card 001-04 (login UI and E2E journey) on branch `card/001-04`, in review. Slice A (email account) is complete once it merges. Next: 001-05 (logout of all devices). Repo: https://github.com/orimazrafi/job-assistant.

## Done recently
- 001-04: React Router pages (`/` protected home, `/login`, `/signup`, `/status` public), auth state in the React Query cache of `/auth/me`, `ProtectedRoute` / `GuestRoute` redirects with a safe `?next`, react-hook-form with the shared zod schemas (moved to `packages/shared`), Playwright journey `e2e/auth.spec.ts`; CI's E2E job now runs `pnpm db:migrate`. Notes: `docs/learning/frontend-auth-routing.md`.
- 001-03 ([PR #7](https://github.com/orimazrafi/job-assistant/pull/7)): sign-up, login, logout endpoints; argon2id; session rotation; `ZodValidationPipe`. Quiz done (weak spots: offline vs online attacks, fixation vs hijacking; added to the notebook).
- 000-06 ([PR #6](https://github.com/orimazrafi/job-assistant/pull/6)): Bull Board queue dashboard (opt-in flag, never in production).
- Tests: 81 unit (API 52, web 25, worker 4), 8 hook-rule groups, 32 integration, 4 E2E.

## Decisions made
- [ADR 009](adr/009-frontend-routing-auth-state-forms.md): React Router; React Query `['auth','me']` as the only auth state (401 = `null`); react-hook-form + shared zod schemas. `packages/shared` now ships zod, so it must stay browser-safe.
- [ADR 007](adr/007-password-hashing-argon2id.md) argon2id via `@node-rs/argon2`; [ADR 008](adr/008-request-validation-zod-pipe.md) zod pipe; 409 on duplicate sign-up (accepted enumeration trade-off).
- Earlier: ADRs [001](adr/001-postgres-plus-mongodb.md)–[006](adr/006-migrations-node-pg-migrate.md); the user wants the why and alternatives of every decision (`.cursor/rules/learning.mdc`).

## Open issues
- Job payloads are trusted with `as` casts in the worker (`system.processor.ts`); job fetching should validate them with zod (schemas can live in `packages/shared`).
- Login and sign-up hash on every request and have no rate limit until 001-06.
- No global 401 handler in the web app yet: only `/auth/me` notices an expired session. Add one when pages fetch user data (ADR 009, "At scale").
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-05: logout of all devices (`user-sessions:<userId>` set, `POST /api/auth/logout-all`, UI button).
2. 001-06: CSRF, CORS, helmet, login rate limits.
3. Learning: lesson 2 (data stores) whenever the user asks.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI (+ queue dashboard)
- [x] Guardrails (rules + shell hook + review at PR merge + GitHub ruleset)
- [x] Learning workflow (briefs, tours, quizzes, notebook)
- [ ] Auth (001-01 to 001-04 done: email accounts work end to end)
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
