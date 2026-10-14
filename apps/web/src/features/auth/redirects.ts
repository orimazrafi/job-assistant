/**
 * The page to open after login. Only same-site paths are allowed: `//evil.com` and `/\evil.com`
 * are treated by browsers as other sites, so they (and anything not starting with `/`) fall back
 * to `/`. This prevents an open redirect through `/login?next=...`.
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}

/** The login URL that brings the user back to `path` afterwards (plain `/login` for the home page). */
export function loginPathFor(path: string): string {
  return path === '/' ? '/login' : `/login?next=${encodeURIComponent(path)}`;
}
