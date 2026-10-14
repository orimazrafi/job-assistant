import { Navigate, Outlet, useSearchParams } from 'react-router';
import { safeNextPath } from './redirects';
import { useAuth } from './useAuth';

/**
 * Layout route for the login and sign-up pages. A signed-in user is sent to `?next` (or home).
 * This is also how a successful login navigates: the mutation stores the user, and this redirects.
 */
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const [params] = useSearchParams();

  if (isLoading) return <p role="status">Checking your session…</p>;
  if (user) return <Navigate to={safeNextPath(params.get('next'))} replace />;
  return <Outlet />;
}
