import { Link, useLocation } from 'react-router';
import { LoginForm } from '../features/auth/LoginForm';

/** `/login`. Keeps `?next` on the sign-up link so either path returns the user where they were going. */
export function LoginPage() {
  const { search } = useLocation();

  return (
    <main>
      <h1>Log in</h1>
      <section>
        <LoginForm />
      </section>
      <p>
        No account yet? <Link to={`/signup${search}`}>Create one</Link>
      </p>
    </main>
  );
}
