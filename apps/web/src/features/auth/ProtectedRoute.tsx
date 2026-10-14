import { Navigate, Outlet, useLocation } from 'react-router';
import { loginPathFor } from './redirects';
import { useAuth } from './useAuth';

/**
 * Layout route for signed-in pages. Waits for `/auth/me` (so a refresh doesn't flash the login
 * page), then renders the page, or redirects to `/login` remembering where the user was going.
 */
export function ProtectedRoute() {
  const { user, isLoading, error } = useAuth();
  const location = useLocation();

  if (isLoading) return <p role="status">Checking your session…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  if (!user) return <Navigate to={loginPathFor(location.pathname + location.search)} replace />;
  return <Outlet />;
}
