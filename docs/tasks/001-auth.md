# Tasks 001 — Authentication

Spec: [001](../specs/001-auth.md) · Design: [auth](../features/auth.md)

Built as vertical slices: after each slice something works in the browser.
Each card = one chat session = one commit (30–90 min). The app must start after every card.

---

## Slice A — Email account (you can sign up and log in)

### 001-01: Users table and repository
- **Files:** `apps/api/src/users/*`, migration tooling, migration for `users`
- **Do:** pick a migration tool (ADR), `users` migration, `UsersRepository` (findByEmail, findById, create).
- **Don't:** add auth logic or endpoints.
- **Done when:** integration tests (Testcontainers Postgres) pass, including unique email.
- **Verify:** `pnpm db:migrate` succeeds; `/api/health` still ok.
- **Status:** done

### 001-02: Session store, cookie, guard, `/auth/me`
- **Files:** `apps/api/src/auth/session.store.ts`, `session.guard.ts`, `cookie.ts`, `current-user.decorator.ts` (+ specs)
- **Do:** Redis sessions (create, get, touch, destroy); `__Host-sid` cookie helpers; guard; `GET /api/auth/me`.
- **Don't:** implement login.
- **Done when:** tests for valid, missing, expired, revoked sessions pass.
- **Verify:** `curl -i http://localhost:3000/api/auth/me` returns 401.
- **Status:** todo

### 001-03: Sign-up, login, logout endpoints
- **Files:** `apps/api/src/auth/password-auth.*`
- **Do:** sign-up and login with argon2id, session rotation on login, logout.
- **Don't:** rate limits, CSRF (slice B), SSO.
- **Done when:** tests cover success, duplicate email, wrong password, logout.
- **Verify:** sign up and log in with curl; `/api/auth/me` returns the user.
- **Status:** todo

### 001-04: Login UI and E2E journey
- **Files:** `apps/web/src/features/auth/*`, `apps/web/src/api/http.ts`, `e2e/auth.spec.ts`
- **Do:** `useAuth` hook, login and sign-up pages, protected route, logout button; Playwright journey.
- **Don't:** SSO buttons.
- **Done when:** component tests and E2E (sign up → log in → refresh still logged in → log out) pass.
- **Verify:** do the journey yourself in the browser.
- **Status:** todo

## Slice B — Session safety

### 001-05: Expiry and logout of all devices
- **Do:** idle (7 d) and absolute (30 d) expiry, `POST /api/auth/logout-all`, button in UI.
- **Done when:** tests for both expiries and logout-all pass; E2E still green.
- **Verify:** log in in two browsers, click "log out everywhere", both are logged out.
- **Status:** todo

### 001-06: CSRF, CORS, helmet, rate limits
- **Do:** CSRF token + Origin check on mutations, strict CORS, helmet, Redis login rate limits.
- **Done when:** tests prove 403 without CSRF token / foreign Origin and 429 after too many failures; E2E still green.
- **Verify:** 6 wrong logins in a row show "Too many attempts".
- **Status:** todo

## Slice C — Google SSO

### 001-07: Generic OIDC + Google (backend)
- **Do:** OIDC service (state, nonce, PKCE in Redis; token validation; find/create/link user) + Google config.
- **Done when:** tests with a mocked provider cover success, bad state, bad nonce, unverified email.
- **Verify:** open `/api/auth/google`, log in, land in the app logged in.
- **Status:** todo

### 001-08: Google button in UI
- **Do:** "Continue with Google" button, error message on failed SSO.
- **Done when:** component tests pass; E2E still green.
- **Verify:** click the button in the browser and get logged in.
- **Status:** todo

## Slice D — LinkedIn SSO (optional)

### 001-09: LinkedIn provider + button
- **Do:** LinkedIn config reusing the generic OIDC service; button in UI.
- **Done when:** same test matrix as Google passes.
- **Status:** todo
