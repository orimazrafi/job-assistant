import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { clearSessionCookie, readSessionId, SESSION_COOKIE, setSessionCookie } from './cookie.js';

describe('readSessionId', () => {
  it('finds the session cookie among others', () => {
    expect(readSessionId(`theme=dark; ${SESSION_COOKIE}=abc123; lang=he`)).toBe('abc123');
  });

  it('returns undefined when the header or the cookie is missing', () => {
    expect(readSessionId(undefined)).toBeUndefined();
    expect(readSessionId('theme=dark')).toBeUndefined();
  });

  it('ignores an empty value and look-alike names', () => {
    expect(readSessionId(`${SESSION_COOKIE}=`)).toBeUndefined();
    expect(readSessionId('sid=abc; x__Host-sid=abc')).toBeUndefined();
  });
});

describe('session cookie writers', () => {
  it('sets an HttpOnly, Secure, SameSite=Lax cookie on / with a max age', () => {
    const res = { cookie: vi.fn() } as unknown as Response;

    setSessionCookie(res, 'abc123', 60);

    expect(res.cookie).toHaveBeenCalledWith(SESSION_COOKIE, 'abc123', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60_000,
    });
  });

  it('clears the cookie with the same attributes, so the browser matches it', () => {
    const res = { clearCookie: vi.fn() } as unknown as Response;

    clearSessionCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });
});
