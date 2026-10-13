/** Error for non-OK HTTP responses; carries the status and the server's message if present. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetches JSON from the API with cookies included (same-origin `/api`).
 * `extraOkStatuses` lets callers treat non-2xx statuses with meaningful bodies
 * (e.g. 503 from the health check) as data instead of errors.
 */
export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  extraOkStatuses: number[] = [],
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', ...init?.headers },
  });
  const body: unknown = await res.json().catch(() => null);
  if (res.ok || extraOkStatuses.includes(res.status)) return body as T;
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : `Request failed with status ${res.status}`;
  throw new ApiError(res.status, message);
}
