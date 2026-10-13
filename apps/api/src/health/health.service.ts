import { Inject, Injectable, Logger } from '@nestjs/common';
import type { DependencyCheckResult, HealthReport } from '@job-assistant/shared';
import { TimeoutError, withTimeout } from '../lib/with-timeout.js';
import {
  DEPENDENCY_CHECKS,
  HEALTH_CHECK_TIMEOUT_MS,
  type DependencyCheck,
} from './dependency-check.js';

/** Runs all dependency checks in parallel and builds the health report. */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @Inject(DEPENDENCY_CHECKS) private readonly checks: DependencyCheck[],
    @Inject(HEALTH_CHECK_TIMEOUT_MS) private readonly timeoutMs: number,
  ) {}

  /** Returns `ok` only if every check is up. A failing or slow check never hides the others. */
  async getReport(): Promise<HealthReport> {
    const results = await Promise.all(
      this.checks.map(async (check) => [check.name, await this.run(check)] as const),
    );
    const checks = Object.fromEntries(results);
    const allUp = results.every(([, result]) => result.status === 'up');
    return { status: allUp ? 'ok' : 'degraded', checks };
  }

  /**
   * Runs one check with a timeout. Error details are logged but not returned,
   * so the public endpoint never leaks hostnames or driver messages.
   */
  private async run(check: DependencyCheck): Promise<DependencyCheckResult> {
    const start = performance.now();
    try {
      await withTimeout(check.check(), this.timeoutMs);
      return { status: 'up', latencyMs: elapsed(start) };
    } catch (error) {
      this.logger.warn(`Health check "${check.name}" failed: ${String(error)}`);
      const reason = error instanceof TimeoutError ? 'timeout' : 'unavailable';
      return { status: 'down', latencyMs: elapsed(start), error: reason };
    }
  }
}

/** Milliseconds since `start`, rounded to whole numbers. */
function elapsed(start: number): number {
  return Math.round(performance.now() - start);
}
