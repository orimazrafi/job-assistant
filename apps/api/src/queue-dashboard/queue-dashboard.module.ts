import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';

/** Served under the global prefix, so the dashboard lives at `/api/queues`. */
export const QUEUE_DASHBOARD_ROUTE = '/queues';

/**
 * The dashboard can retry and delete jobs and shows job data, and it has no login yet,
 * so it is never mounted in production. Reads env after ConfigModule has loaded `.env`.
 */
function dashboardEnabled(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV !== 'production';
}

/**
 * Bull Board (queue dashboard) for development. Import `forRoot()` once in AppModule, and
 * `forQueue(name)` in each module that registers a queue, so modules own their dashboard entries.
 */
@Module({})
export class QueueDashboardModule {
  /** Mounts the dashboard UI and API at `/api/queues`, outside production only. */
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
