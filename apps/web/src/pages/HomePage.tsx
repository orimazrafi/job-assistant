import { Link } from 'react-router';
import { AccountPanel } from '../features/auth/AccountPanel';

/** `/`, signed-in only. A placeholder for the job dashboard. */
export function HomePage() {
  return (
    <main>
      <h1>Job Assistant</h1>
      <AccountPanel />
      <p>
        <Link to="/status">System status</Link>
      </p>
    </main>
  );
}
