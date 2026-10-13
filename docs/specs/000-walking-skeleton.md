# 000 — Walking skeleton

## Goal
Prove that every part of the stack runs and connects before any business feature is built: React → NestJS API → Postgres, MongoDB, Redis → BullMQ → NestJS worker, with tests and CI from day one.

## User stories
- As the developer, I want one command to start everything, so I can see the app working at any time.
- As the developer, I want a status page, so I immediately see which dependency is broken.

## Acceptance criteria
- [ ] `docker compose up -d` starts Postgres, MongoDB, and Redis with health checks.
- [ ] `pnpm dev` starts the API (port 3000), worker, and web app (port 5173).
- [ ] Env vars are validated at startup; a missing/invalid var stops the app with a clear message.
- [ ] `GET /api/health` returns 200 `{ status: "ok", checks: { postgres, mongo, redis } }`, each with `status` and `latencyMs`.
- [ ] If any dependency is down or slower than 2 s, `GET /api/health` returns 503 with `status: "degraded"` and still reports the other checks.
- [ ] `POST /api/system/ping` enqueues a `ping` job on the `system` queue; the worker answers; the API returns `{ pong: true, roundTripMs }`.
- [ ] If the worker does not answer within 5 s, `POST /api/system/ping` returns 504.
- [ ] The web app shows each dependency's status and has a "Ping worker" button that shows the round trip.
- [ ] Tests: unit (API, worker, web), integration (API health against real DBs via Testcontainers), E2E smoke (Playwright).
- [ ] CI runs lint, typecheck, unit, integration, and E2E tests on every push and pull request.

## Out of scope
- Any business feature, auth, migrations, deployment.

## Open questions
- None.
