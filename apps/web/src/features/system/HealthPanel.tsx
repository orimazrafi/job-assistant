import { StatusBadge } from '../../components/StatusBadge';
import { useHealth } from './useHealth';

/** Lists each backend dependency with its status and latency; shows a message if the API is unreachable. */
export function HealthPanel() {
  const { data, isPending, isError } = useHealth();

  return (
    <section aria-labelledby="health-heading">
      <h2 id="health-heading">Dependencies</h2>
      {isPending && <p>Checking…</p>}
      {isError && <p role="alert">API is unreachable.</p>}
      {data && (
        <>
          <p>
            Overall: <strong>{data.status}</strong>
          </p>
          <ul>
            {Object.entries(data.checks).map(([name, check]) => (
              <li key={name}>
                <span>{name}</span>
                <span>
                  <StatusBadge status={check.status} /> {check.latencyMs} ms
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
