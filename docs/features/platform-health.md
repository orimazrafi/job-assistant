# Feature: Platform health (walking skeleton)

**Status:** Done
**Spec:** [000](../specs/000-walking-skeleton.md) · **Tasks:** [000](../tasks/000-walking-skeleton.md)

## TL;DR
A status page proves the whole stack works: the API checks Postgres, MongoDB, and Redis, and a "ping" job travels through the BullMQ queue to the worker and back. If anything breaks, the page and `GET /api/health` say exactly what.

## How it flows

```mermaid
flowchart LR
    WEB["React status page"] -->|"GET /api/health"| API["NestJS API"]
    WEB -->|"POST /api/system/ping"| API
    API -->|"SELECT 1"| PG[("Postgres")]
    API -->|"ping command"| MG[("MongoDB")]
    API -->|"PING"| RD[("Redis")]
    API -->|"add ping job"| Q[["BullMQ system queue"]]
    Q --> WK["NestJS worker"]
    WK -->|"pong result"| Q
```

## Health check step by step

```mermaid
sequenceDiagram
    participant W as React
    participant A as HealthService
    participant P as Postgres
    participant M as MongoDB
    participant R as Redis
    W->>A: GET /api/health
    par each check with a 2 s timeout
        A->>P: SELECT 1
        A->>M: ping
        A->>R: PING
    end
    alt all up
        A-->>W: 200 status ok + latency per check
    else any down or slow
        A-->>W: 503 status degraded, failing check marked down
    end
```

## Worker ping step by step

```mermaid
sequenceDiagram
    participant W as React
    participant A as SystemService
    participant Q as Redis queue
    participant K as Worker
    W->>A: POST /api/system/ping
    A->>Q: add ping job
    Q->>K: deliver job
    K-->>Q: result pong, pid, time
    Q-->>A: completed event via QueueEvents
    A-->>W: 200 pong + roundTripMs
    Note over A,W: If no answer within 5 s, remove the job and return 504
```

## Queue dashboard (development only)

Bull Board shows every BullMQ queue at `/api/queues` (also through the web app: http://localhost:5173/api/queues): jobs waiting, active, completed, and failed, with retry and delete buttons.

```mermaid
flowchart LR
    B["Browser /api/queues"] --> BB["Bull Board (API middleware)"]
    BB -->|"read counts and jobs"| Q[["BullMQ queues in Redis"]]
    SM["SystemModule: forQueue('system')"] -.->|"registers"| BB
```

It is mounted only when `NODE_ENV` is not `production`, because it can change jobs and has no login yet. Each module that registers a queue also adds it to the dashboard with `QueueDashboardModule.forQueue(name)`.

## Key decisions
- Raw drivers (`pg`, `mongodb`, `ioredis`), no ORM yet — [ADR 005](../adr/005-toolchain.md)
- BullMQ on Redis — [ADR 002](../adr/002-bullmq-on-redis.md)
- Same-origin `/api` through the Vite proxy so future auth cookies stay first-party — [ADR 003](../adr/003-server-side-sessions.md)

## Failure handling
- A dependency that errors or exceeds 2 s is reported `down` with `unavailable` or `timeout`; details go to logs only, never to the response.
- Clients connect lazily, so the API starts even when a database is down.
- Unknown job names fail permanently in the worker (no retries).
- Missing or invalid env vars stop the API/worker at startup with a list of problems.

## Where the code lives
- `apps/api/src/health/` — checks, service, controller
- `apps/api/src/system/` — ping endpoint, QueueEvents, WorkerTimeoutError
- `apps/api/src/queue-dashboard/` — Bull Board, development only
- `apps/api/src/infra/` — Postgres/Mongo/Redis clients (composition root)
- `apps/worker/src/system/` — `SystemProcessor`, `PingService`
- `apps/web/src/features/system/` — `HealthPanel`, `PingPanel`, hooks
- `e2e/smoke.spec.ts` — the end-to-end proof
