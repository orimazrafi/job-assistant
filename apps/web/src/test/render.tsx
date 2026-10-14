import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

/** A fresh QueryClient with retries off, so error states appear immediately. */
function testQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/** Renders `ui` inside a fresh QueryClient. */
export function renderWithQuery(ui: ReactElement) {
  return render(<QueryClientProvider client={testQueryClient()}>{ui}</QueryClientProvider>);
}

/** Renders `ui` (usually `<AppRoutes />`) with a fresh QueryClient and an in-memory router at `path`. */
export function renderWithRouter(ui: ReactElement, path = '/') {
  return render(
    <QueryClientProvider client={testQueryClient()}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

/** JSON response with `status`; no body when `body` is undefined (e.g. 204). */
function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Replaces global fetch with a stub that answers every request with `status` and `body`. */
export function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(status, body));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

type FakeAnswer = { status: number; body?: unknown };

/**
 * Replaces global fetch with a fake API: `routes` maps `"METHOD /path"` to an answer.
 * A request with no matching route rejects, so an unexpected call fails the test.
 */
export function stubFetchRoutes(routes: Record<string, FakeAnswer>) {
  const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${path}`;
    const answer = routes[key];
    if (!answer) throw new Error(`Unexpected request: ${key}`);
    return jsonResponse(answer.status, answer.body);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
