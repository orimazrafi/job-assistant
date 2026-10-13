import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { NotAuthenticatedError } from './auth.errors.js';
import { SESSION_COOKIE } from './cookie.js';
import type { Session } from './session.js';
import { SessionGuard } from './session.guard.js';
import type { SessionStore } from './session.store.js';

const session: Session = { id: 's'.repeat(43), userId: 'user-1', createdAt: 1, lastSeenAt: 1 };

/** Guard with a fake store that knows only `known` (or no session at all). */
function setup(known: Session | null) {
  const store = {
    get: vi.fn().mockResolvedValue(known),
    touch: vi.fn().mockResolvedValue(known),
  };
  return { store, guard: new SessionGuard(store as unknown as SessionStore) };
}

/** Fake HTTP context with an optional Cookie header; exposes the request and response. */
function httpContext(cookie?: string) {
  const req: { headers: { cookie?: string }; auth?: unknown } = { headers: { cookie } };
  const res = { clearCookie: vi.fn() };
  const context = {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
  } as unknown as ExecutionContext;
  return { req, res, context };
}

describe('SessionGuard', () => {
  it('lets a valid session through, touches it, and sets req.auth', async () => {
    const { store, guard } = setup(session);
    const { req, context } = httpContext(`${SESSION_COOKIE}=${session.id}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(store.get).toHaveBeenCalledWith(session.id);
    expect(store.touch).toHaveBeenCalledWith(session);
    expect(req.auth).toEqual({ userId: 'user-1', sessionId: session.id });
  });

  it('rejects a request without the cookie and does not query the store', async () => {
    const { store, guard } = setup(session);

    await expect(guard.canActivate(httpContext('theme=dark').context)).rejects.toBeInstanceOf(NotAuthenticatedError);
    expect(store.get).not.toHaveBeenCalled();
  });

  it('rejects an unknown, expired, or revoked session and clears the dead cookie', async () => {
    const { store, guard } = setup(null);
    const { req, res, context } = httpContext(`${SESSION_COOKIE}=${session.id}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(NotAuthenticatedError);

    expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE, expect.any(Object));
    expect(store.touch).not.toHaveBeenCalled();
    expect(req.auth).toBeUndefined();
  });
});
