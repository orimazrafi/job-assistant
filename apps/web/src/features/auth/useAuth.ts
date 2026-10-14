import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../../api/auth';
import { authKeys } from './queryKeys';

/**
 * Owns the "who is signed in" query (`GET /api/auth/me`), the single source of truth for auth in
 * the UI. `user` is null when signed out. After a minute the answer counts as stale, so returning to
 * the tab re-checks it and an expired session is noticed.
 */
export function useAuth() {
  const query = useQuery({ queryKey: authKeys.me, queryFn: fetchCurrentUser, staleTime: 60_000 });
  return { user: query.data ?? null, isLoading: query.isPending, error: query.error };
}
