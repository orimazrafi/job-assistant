import type { HealthReport, PingResponse } from '@job-assistant/shared';
import { requestJson } from './http';

/** `GET /api/health`. A 503 still carries a full report, so it is returned as data. */
export function fetchHealth(): Promise<HealthReport> {
  return requestJson<HealthReport>('/api/health', undefined, [503]);
}

/** `POST /api/system/ping`. Rejects with ApiError(504) if the worker does not answer. */
export function pingWorker(): Promise<PingResponse> {
  return requestJson<PingResponse>('/api/system/ping', { method: 'POST' });
}
