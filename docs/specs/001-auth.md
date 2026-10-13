# 001 — Authentication (email + Google/LinkedIn SSO)

## Goal
Users can create an account and sign in with email/password, Google, or LinkedIn. Sessions are secure, survive browser restarts, and can be revoked instantly.

## User stories
- As a job seeker, I want to sign in with LinkedIn, so I don't need another password.
- As a job seeker, I want to sign up with email and password, so I can use the app without SSO.
- As a user, I want to log out of all devices, so a lost laptop can't access my data.

## Acceptance criteria
- [ ] Sign up with email + password (min 10 chars); password stored as argon2id hash.
- [ ] Log in with email + password; wrong credentials return a generic error.
- [ ] More than 5 failed logins per account per 15 min, or 20 per IP per 15 min, returns 429.
- [ ] Sign in with Google (OIDC, Authorization Code + PKCE, handled by the API).
- [ ] Optional, after Google: sign in with LinkedIn reusing the same OIDC flow.
- [ ] SSO links to an existing account only if the provider's email is verified.
- [ ] Successful login sets `__Host-sid` with `HttpOnly; Secure; SameSite=Lax; Path=/`.
- [ ] A new session id is issued on every login.
- [ ] Session expires after 7 days idle or 30 days total.
- [ ] `GET /auth/me` returns the current user or 401.
- [ ] `POST /auth/logout` deletes the session; `POST /auth/logout-all` deletes all user sessions.
- [ ] Mutating requests without a valid CSRF token or with a foreign `Origin` return 403.
- [ ] Protected React routes redirect to `/login` when `/auth/me` returns 401.

## Out of scope
- Password reset and email verification (separate spec).
- MFA.
- GitHub SSO.

## Open questions
- None.
