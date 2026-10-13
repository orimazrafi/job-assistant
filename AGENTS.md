# Job Assistant

Finds relevant software jobs in central Israel, scores them against the user's CV, tracks applications, and drafts outreach messages to recruiters. Free to run: free job sources and free/local AI only.

## Architecture (see docs/architecture.md for diagrams)
- `apps/api` — NestJS REST API. Layers: controller → service → repository.
- `apps/worker` — NestJS BullMQ workers: fetch → normalize → dedupe → score → notify.
- `apps/web` — React + TypeScript + React Query.
- `packages/shared` — shared TS types and DTOs.
- PostgreSQL — users, identities, normalized jobs, applications, contacts, drafts.
- MongoDB — raw source payloads, AI generation history.
- Redis — BullMQ queues, sessions, dedupe keys, rate limits, cache.
- AI — `LlmProvider` interface: Ollama locally, Gemini free tier for the public demo.

## Where things live
- `docs/architecture.md` — system overview diagrams. Start here.
- `docs/features/` — one doc per feature, with diagrams. Read instead of code.
- `docs/specs/` — what a feature must do (acceptance criteria).
- `docs/tasks/` — small task cards derived from specs.
- `docs/adr/` — why big decisions were made.
- `docs/progress.md` — current state and next steps. Read at the start of every session.

## Workflow
1. `product-manager` skill writes a spec.
2. `architect` skill designs it: diagrams first, ADR if needed, then task cards.
3. `qa-engineer` writes tests from acceptance criteria.
4. `backend-dev` / `frontend-dev` implement one task card per session.
5. `code-reviewer` checks the diff against spec, rules, and diagrams.
6. `handoff` updates docs/progress.md before the session ends.

## Commands
Requires Node 24+, pnpm 12, Docker. First time: `cp .env.example .env && pnpm install`.
- `docker compose up -d` — Postgres (host port 5433), MongoDB, Redis
- `pnpm dev` — API :3000, worker, web :5173 (status page)
- `pnpm lint` / `pnpm typecheck`
- `pnpm test` — unit tests (all apps)
- `pnpm test:int` — integration tests with Testcontainers (Docker must be running)
- `pnpm test:e2e` — builds, starts all apps, runs Playwright smoke tests (needs `docker compose up -d`)

## Conventions worth knowing
- ESM everywhere: relative imports end in `.js` in `apps/api`, `apps/worker`, `packages/shared`.
- After changing `packages/shared`, it rebuilds automatically under `pnpm dev`; otherwise run `pnpm install` or `pnpm --filter @job-assistant/shared build`.
