# Progress

## Current focus
Project setup: AI workflow (rules, personas, docs). No code scaffolded yet.

## Done this session
- Created repo, `AGENTS.md`, Cursor rules, persona skills.
- Wrote architecture overview, ADRs 001–004, specs 001 (auth) and 002 (job fetching).
- Designed auth feature with diagrams (`docs/features/auth.md`) and task cards (`docs/tasks/001-auth.md`).

## Decisions made
- Postgres + MongoDB split — [ADR 001](adr/001-postgres-plus-mongodb.md)
- BullMQ on Redis — [ADR 002](adr/002-bullmq-on-redis.md)
- Server-side sessions, not JWT — [ADR 003](adr/003-server-side-sessions.md)
- Free sources and free AI only — [ADR 004](adr/004-free-sources-and-ai.md)

## Open issues
- Confirm seed list of central-Israel companies and their ATS (Greenhouse / Lever / Comeet / ...).

## Next steps
1. Scaffold monorepo: pnpm workspaces, `apps/api`, `apps/worker`, `apps/web`, `docker-compose.yml`, CI.
2. Task 001-01: users + identities migration and repositories.
3. Task 001-02: Redis session store.

## Roadmap
- [x] AI workflow setup
- [ ] Scaffold + CI
- [ ] Auth
- [ ] Job fetching
- [ ] Relevance scoring
- [ ] Dashboard + application tracker
- [ ] AI match explanations
- [ ] Outreach drafts + follow-ups
