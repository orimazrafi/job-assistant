/** Types for `GET /api/health`, shared by the API and the web app. */

export type CheckStatus = 'up' | 'down';

export interface DependencyCheckResult {
  status: CheckStatus;
  latencyMs: number;
  /** Present only when `status` is `down`. */
  error?: string;
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  checks: Record<string, DependencyCheckResult>;
}
