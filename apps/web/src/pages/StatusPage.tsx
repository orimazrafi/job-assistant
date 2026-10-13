import { HealthPanel } from '../features/system/HealthPanel';
import { PingPanel } from '../features/system/PingPanel';

/** System status page: dependency health and worker round trip. */
export function StatusPage() {
  return (
    <main>
      <h1>Job Assistant — System status</h1>
      <HealthPanel />
      <PingPanel />
    </main>
  );
}
