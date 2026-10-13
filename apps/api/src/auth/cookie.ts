import type { CookieOptions, Response } from 'express';

/**
 * Session cookie name. The `__Host-` prefix makes browsers reject it unless it is Secure,
 * has `Path=/`, and has no `Domain`, so a subdomain cannot set or overwrite it.
 */
export const SESSION_COOKIE = '__Host-sid';

/** HttpOnly: page scripts cannot read it. SameSite=Lax: other sites cannot send it on POSTs. */
const COOKIE_OPTIONS: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };

/** Reads the session id from a `Cookie` request header; undefined when absent or empty. */
export function readSessionId(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const pair of cookieHeader.split(';')) {
    const eq = pair.indexOf('=');
    if (eq !== -1 && pair.slice(0, eq).trim() === SESSION_COOKIE) {
      return pair.slice(eq + 1).trim() || undefined;
    }
  }
  return undefined;
}

/** Sets the session cookie. `maxAgeSeconds` keeps it across browser restarts; Redis decides validity. */
export function setSessionCookie(res: Response, sessionId: string, maxAgeSeconds: number): void {
  res.cookie(SESSION_COOKIE, sessionId, { ...COOKIE_OPTIONS, maxAge: maxAgeSeconds * 1000 });
}

/** Tells the browser to delete the session cookie. */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, COOKIE_OPTIONS);
}
