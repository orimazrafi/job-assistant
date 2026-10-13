import { usePingWorker } from './usePingWorker';

/** Button that sends a ping job through the queue and shows the worker's round-trip time or the error. */
export function PingPanel() {
  const ping = usePingWorker();

  return (
    <section aria-labelledby="ping-heading">
      <h2 id="ping-heading">Background worker</h2>
      <button type="button" onClick={() => ping.mutate()} disabled={ping.isPending}>
        {ping.isPending ? 'Pinging…' : 'Ping worker'}
      </button>
      <p aria-live="polite">
        {ping.isSuccess && `Worker answered in ${ping.data.roundTripMs} ms.`}
        {ping.isError && ping.error.message}
      </p>
    </section>
  );
}
