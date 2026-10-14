import { Link, useLocation } from 'react-router';
import { SignupForm } from '../features/auth/SignupForm';

/** `/signup`. */
export function SignupPage() {
  const { search } = useLocation();

  return (
    <main>
      <h1>Create your account</h1>
      <section>
        <SignupForm />
      </section>
      <p>
        Already have an account? <Link to={`/login${search}`}>Log in</Link>
      </p>
    </main>
  );
}
