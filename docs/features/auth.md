# Feature: Authentication

**Status:** In progress (`users` table and repository done; no endpoints yet)
**Spec:** [001](../specs/001-auth.md) · **Tasks:** [001](../tasks/001-auth.md)

## TL;DR
Users sign in with email/password, Google, or LinkedIn. The API keeps the session in Redis and gives the browser only a random id in a locked-down cookie, so nothing sensitive lives in the browser and logout is instant.

## How it flows

```mermaid
flowchart LR
    B["Browser"] -->|"__Host-sid cookie"| G["SessionGuard"]
    G -->|"lookup sess:id"| R[("Redis")]
    G -->|"valid"| C["Controller"]
    G -->|"missing or expired"| E["401"]
    C --> S["Service"] --> P[("Postgres users")]
```

## SSO login step by step (Google / LinkedIn)

```mermaid
sequenceDiagram
    actor U as User
    participant W as React
    participant A as NestJS API
    participant R as Redis
    participant I as Google / LinkedIn
    participant P as Postgres
    U->>W: Click "Sign in with LinkedIn"
    W->>A: GET /auth/linkedin
    A->>R: Save state, nonce, PKCE verifier (5 min)
    A-->>U: 302 to LinkedIn
    U->>I: Log in and consent
    I-->>A: GET /auth/linkedin/callback with code and state
    A->>R: Load and delete state (one-time use)
    A->>I: Exchange code + verifier for ID token
    A->>A: Verify signature, iss, aud, exp, nonce
    A->>P: Find identity or create/link user
    A->>R: Create NEW session (rotate id)
    A-->>U: Set __Host-sid, 302 to app
```

## Email login step by step

```mermaid
sequenceDiagram
    actor U as User
    participant A as NestJS API
    participant R as Redis
    participant P as Postgres
    U->>A: POST /auth/login (email, password, CSRF token)
    A->>R: Check rate limit (IP + account)
    A->>P: Load user by email
    A->>A: argon2 verify
    alt valid
        A->>R: Create NEW session
        A-->>U: 200 + Set __Host-sid
    else invalid
        A->>R: Increment failure counter
        A-->>U: 401 generic error
    end
```

## Data model

```mermaid
erDiagram
    USERS ||--o{ USER_IDENTITIES : "signs in with"
    USERS {
        uuid id PK
        text email UK "trimmed, lowercase"
        text password_hash "null for SSO-only"
        bool email_verified
        timestamptz created_at
        timestamptz updated_at
    }
    USER_IDENTITIES {
        uuid id PK
        uuid user_id FK
        text provider "google | linkedin"
        text provider_user_id
        timestamptz created_at
    }
```

Redis keys:
- `sess:<id>` → `{ userId, createdAt, lastSeenAt }`, TTL = idle timeout
- `user-sessions:<userId>` → set of session ids (for logout-all)
- `oidc:<state>` → `{ nonce, verifier, provider }`, TTL 5 min
- `rl:login:ip:<ip>`, `rl:login:acct:<email>` → failure counters, TTL 15 min

Built so far: `USERS` (migration `apps/api/migrations/*_create-users.sql`). A check constraint keeps emails trimmed and lowercase, so the unique constraint makes sign-up case-insensitive. `USER_IDENTITIES` comes with Google sign-in (card 001-07).

Unique constraint: `(provider, provider_user_id)` on `user_identities`.

## Key decisions
- Sessions in Redis, not JWT — [ADR 003](../adr/003-server-side-sessions.md)
- Schema changes as plain SQL migrations with node-pg-migrate — [ADR 006](../adr/006-migrations-node-pg-migrate.md)

## Failure handling
- Expired/unknown session → 401 → React redirects to `/login`.
- Invalid `state` or `nonce` on callback → 400, no session created.
- Provider email not verified and email already exists → refuse to link, show message.
- Rate limit exceeded → 429 with `Retry-After`.

## Where the code lives (planned)
- `apps/api/src/auth/` — controllers, services, guard, OIDC client, session store
- `apps/api/src/users/` — `UsersRepository` (built), identities repository (planned)
- `apps/api/migrations/` — SQL migrations
- `apps/web/src/features/auth/` — `useAuth`, login page, protected route
