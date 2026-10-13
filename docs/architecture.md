# Architecture overview

> Read this first. Each feature has its own detailed doc in `docs/features/`.

## TL;DR
A React app talks to a NestJS API using a secure session cookie. Background NestJS workers pull jobs from free sources on a schedule, store raw data in MongoDB, normalized data in PostgreSQL, score jobs against the user's CV with free/local AI, and notify the user.

## System map

```mermaid
flowchart LR
    U(("User")) --> WEB["React app"]
    WEB -->|"HTTPS + __Host-sid cookie"| API["NestJS API"]
    API --> PG[("PostgreSQL")]
    API --> RD[("Redis")]
    API -->|"enqueue"| Q[["BullMQ queues"]]
    Q --> WK["NestJS workers"]
    WK -->|"fetch"| SRC["Job sources: Greenhouse, Lever, Comeet, ..."]
    WK --> MG[("MongoDB")]
    WK --> PG
    WK --> AI["LLM: Ollama / Gemini"]
    API -->|"SSO"| IDP["Google / LinkedIn"]
```

## What each store holds

| Store | Holds | Why this store |
|---|---|---|
| PostgreSQL | users, identities, jobs, applications, contacts, drafts | Relational data, constraints, joins |
| MongoDB | raw source payloads, AI generation history | Varied shapes, append-heavy, re-processable |
| Redis | queues, sessions, dedupe keys, rate limits, cache | Fast, expiring keys |

See [ADR 001](adr/001-postgres-plus-mongodb.md) and [ADR 002](adr/002-bullmq-on-redis.md).

## Job pipeline (background)

```mermaid
flowchart LR
    S["Scheduler every 6h"] --> F["fetch-source job"]
    F --> RAW[("Mongo raw_postings")]
    F --> N["normalize job"]
    N --> D{"Seen before?"}
    D -->|"yes"| X["skip"]
    D -->|"no"| J[("Postgres jobs")]
    J --> SC["score job"]
    SC --> M{"Good match?"}
    M -->|"yes"| NT["notify user"]
```

## Monorepo layout (planned)

```
apps/api       NestJS REST API
apps/worker    NestJS BullMQ workers
apps/web       React + Vite
packages/shared  shared types/DTOs
```

## Features

| Feature | Spec | Design doc | Status |
|---|---|---|---|
| Auth (email + Google/LinkedIn SSO) | [001](specs/001-auth.md) | [auth](features/auth.md) | Designed |
| Job fetching | [002](specs/002-job-fetching.md) | — | Spec |
| Relevance scoring | — | — | Planned |
| Dashboard + application tracker | — | — | Planned |
| AI match explanations | — | — | Planned |
| Outreach drafts + follow-ups | — | — | Planned |
