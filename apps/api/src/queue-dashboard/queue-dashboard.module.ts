import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import { validateEnv } from '../config/env.js';

/** Served under the global prefix, so the dashboard lives at `/api/queues`. */
export const QUEUE_DASHBOARD_ROUTE = '/queues';

/**
 * The dashboard can retry and delete jobs and shows job data, and it has no login yet. Fail-closed:
 * mounted only when QUEUE_DASHBOARD_ENABLED is true AND not in production, so forgetting either
 * setting keeps it off. Called after ConfigModule has loaded `.env`; parses with the same schema
 * so defaults and boolean parsing match the validated config.
 */
export function dashboardEnabled(env: NodeJS.ProcessEnv): boolean {
  const { QUEUE_DASHBOARD_ENABLED, NODE_ENV } = validateEnv(env);
  return QUEUE_DASHBOARD_ENABLED && NODE_ENV !== 'production';
}

/**
 * Bull Board (queue dashboard) for development. Import `forRoot()` once in AppModule, and
 * `forQueue(name)` in each module that registers a queue, so modules own their dashboard entries.
 */
@Module({})
export class QueueDashboardModule {
  /** Mounts the dashboard UI and API at `/api/queues` when enabled (see `dashboardEnabled`). */
  static forRoot() {
    return ConditionalModule.registerWhen(
      BullBoardModule.forRoot({ route: QUEUE_DASHBOARD_ROUTE, adapter: ExpressAdapter }),
      dashboardEnabled,
    );
  }

  /** Shows the BullMQ queue `name` on the dashboard; the queue must be registered with BullModule. */
  static forQueue(name: string) {
    return ConditionalModule.registerWhen(BullBoardModule.forFeature({ name, adapter: BullMQAdapter }), dashboardEnabled);
  }
}
