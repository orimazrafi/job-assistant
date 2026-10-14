import { useAuth } from './useAuth';
import { useLogout } from './useAuthMutations';

/** Shows who is signed in and a logout button. Rendered only inside ProtectedRoute. */
export function AccountPanel() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <section aria-labelledby="account-heading">
      <h2 id="account-heading">Account</h2>
      <p>
        Signed in as <strong>{user?.email}</strong>
      </p>
      <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending}>
        {logout.isPending ? 'Logging out…' : 'Log out'}
      </button>
      {logout.isError && <p role="alert">{logout.error.message}</p>}
    </section>
  );
}
