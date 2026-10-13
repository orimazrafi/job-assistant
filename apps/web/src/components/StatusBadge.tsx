import type { CheckStatus } from '@job-assistant/shared';

/** Colored pill showing "up" or "down". */
export function StatusBadge({ status }: { status: CheckStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
