# Tasks 000 — Walking skeleton

Spec: [000](../specs/000-walking-skeleton.md) · Design: [platform-health](../features/platform-health.md)

Each card = one commit. The app must start after every card.

---

## 000-01: Monorepo and tooling
- **Files:** root config, `packages/shared`, `docker-compose.yml`, `.env.example`
- **Do:** pnpm workspaces, TypeScript 6 base config, ESLint, Prettier, shared types package, Docker Compose for Postgres/MongoDB/Redis.
- **Don't:** write app code.
- **Done when:** `pnpm install`, `pnpm build`, `pnpm lint` pass; `docker compose up -d` shows 3 healthy containers.
- **Verify:** `docker compose ps` shows all services `healthy`.
- **Status:** done

## 000-02: API with health check
- **Files:** `apps/api/**`
- **Do:** NestJS API, env validation, infra providers (pg, MongoDB, Redis), `GET /api/health` with per-check timeout.
- **Don't:** add queue code.
- **Done when:** unit tests (health service) and integration test (Testcontainers) pass.
- **Verify:** `curl http://localhost:3000/api/health` returns `"status":"ok"`.
- **Status:** done

## 000-03: Worker and ping job
- **Files:** `apps/worker/**`, `apps/api/src/system/**`
- **Do:** NestJS worker app with a BullMQ `system` queue processor; `POST /api/system/ping` waits for the result (5 s timeout → 504).
- **Don't:** add real job types.
- **Done when:** unit tests for the processor and system service pass.
- **Verify:** with `pnpm dev` running, `curl -X POST http://localhost:3000/api/system/ping` returns `"pong":true`.
- **Status:** done

## 000-04: Web status page
- **Files:** `apps/web/**`
- **Do:** Vite + React + React Query; status page with dependency list and "Ping worker" button; Vite proxy `/api` → API.
- **Don't:** add routing or styling frameworks.
- **Done when:** component tests pass.
- **Verify:** open http://localhost:5173 and see three green checks; click "Ping worker".
- **Status:** done

## 000-05: E2E smoke test and CI
- **Files:** `e2e/**`, `playwright.config.ts`, `.github/workflows/ci.yml`
- **Do:** Playwright smoke test (status page all up, ping works); GitHub Actions running lint, typecheck, unit, integration, E2E.
- **Done when:** `pnpm test:e2e` passes locally.
- **Verify:** `pnpm test:e2e` prints `passed`.
- **Status:** done (CI workflow written; first run happens once the repo is pushed to GitHub)
