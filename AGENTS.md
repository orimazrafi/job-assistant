# Job Assistant

Finds relevant software jobs in central Israel, scores them against the user's CV, tracks applications, and drafts outreach messages to recruiters. Free to run: free job sources and free/local AI only.

Stack: `apps/api` (NestJS), `apps/worker` (NestJS + BullMQ), `apps/web` (React), `packages/shared` (types); PostgreSQL, MongoDB, Redis. Diagrams: `docs/architecture.md`.

## Where things go
| Content | Location |
|---|---|
| Why a decision was made | `docs/adr/` |
| What a feature does and how it flows (with diagrams) | `docs/features/` |
| What a feature must do (acceptance criteria) | `docs/specs/` |
| Small units of work | `docs/tasks/` |
| Must / must-not rules | `.cursor/rules/` |
| How to work in this repo | this file |
| Current state and next steps (read first every session) | `docs/progress.md` |

Roles (product-manager, architect, qa-engineer, backend-dev, frontend-dev, code-reviewer, handoff) are skills in `.cursor/skills/`.

## Commands
Requires Node 24+, pnpm 12, Docker. First time: `cp .env.example .env && pnpm install`.
- `docker compose up -d` — Postgres (host port 5433), MongoDB, Redis
- `pnpm dev` — API :3000, worker, web :5173 (status page)
- `pnpm lint` / `pnpm typecheck`
- `pnpm test` — unit tests (all apps)
- `pnpm test:int` — integration tests with Testcontainers (Docker must be running)
- `pnpm test:e2e` — builds, starts all apps, runs Playwright smoke tests (needs `docker compose up -d`)

## Pitfalls
- ESM everywhere: relative imports end in `.js` in `apps/api`, `apps/worker`, `packages/shared`.
- After changing `packages/shared`, it rebuilds automatically under `pnpm dev`; otherwise run `pnpm --filter @job-assistant/shared build`.
- Postgres is on host port 5433, not 5432 (a native PostgreSQL may own 5432).
- `ConfigModule` reads env when `AppModule` is imported; tests that set env must import `AppModule` afterwards.
