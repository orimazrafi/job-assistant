# Progress

## Current focus
Walking skeleton is done and the repo is public on GitHub: https://github.com/orimazrafi/job-assistant. Next: auth slice A (email account), starting with task 001-01.

## Done recently
- Walking skeleton (spec 000), one commit per card 000-01 … 000-05:
  monorepo + Docker infra, API health check, worker + queue ping, React status page, Playwright smoke + CI workflow.
- Tests: 20 unit (API 11, worker 4, web 5), 3 hook-rule suites, 2 integration (Testcontainers), 2 E2E — all green locally.
- `AGENTS.md` trimmed to "how to work here" with a where-things-go map.
- Guardrails: `guardrails.mdc` and `definition-of-done.mdc` (always applied); shell hook `.cursor/hooks/guard-shell.mjs` denies destructive commands and asks before E2E, pushes, DB clients, and secrets access.
- Code review gate: every card on its own branch; the agent shows the changes and commits only after the user approves; pushes and PRs need approval; only the user merges on GitHub. Enforced by `guardrails.mdc` and the shell hook (blocks commit, merge, and push on `main` and `gh pr merge`).
- Auth task cards reorganized into vertical slices; LinkedIn SSO marked optional.

## Decisions made
- Toolchain: pnpm, ESM, TypeScript 6 (TS 7 not yet supported by typescript-eslint), Vitest, Playwright, raw drivers — [ADR 005](adr/005-toolchain.md)
- Earlier: [ADR 001](adr/001-postgres-plus-mongodb.md) Postgres + Mongo, [ADR 002](adr/002-bullmq-on-redis.md) BullMQ, [ADR 003](adr/003-server-side-sessions.md) sessions, [ADR 004](adr/004-free-sources-and-ai.md) free sources/AI.

## Open issues
- Local Postgres for this project is on host port **5433** (a native PostgreSQL 16 service uses 5432).
- No branch protection on GitHub: the review gate lives in the agent's rules and hook only. Pushes from the user's own terminal are not checked.
- pnpm 12 requires explicit build-script approval; optional native add-ons are denied in `pnpm-workspace.yaml` (`allowBuilds`).
- The guard hook only sees the agent's shell commands, not the user's own terminal.
- Confirm seed list of central-Israel companies for spec 002.

## Next steps
1. 001-01 (on branch `card/001-01`): choose migration tool (ADR) + `users` table + repository.
2. 001-02: Redis session store, cookie, guard, `GET /api/auth/me`.
3. 001-03: sign-up / login / logout endpoints.

## Roadmap
- [x] AI workflow setup
- [x] Walking skeleton + CI
- [x] Guardrails (rules + shell hook)
- [ ] Auth
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
