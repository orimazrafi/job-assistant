/** Queue names, job names, and payload types shared by the API (producer) and worker (consumer). */

export const QUEUES = {
  system: 'system',
} as const;

export const SYSTEM_JOBS = {
  ping: 'ping',
} as const;

export interface PingJobData {
  sentAt: string;
}

export interface PingJobResult {
  pong: true;
  processedAt: string;
  workerPid: number;
}

/** Response body of `POST /api/system/ping`. */
export interface PingResponse extends PingJobResult {
  roundTripMs: number;
}
