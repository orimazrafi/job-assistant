import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  QUEUES,
  SYSTEM_JOBS,
  type PingJobData,
  type PingJobResult,
  type PingResponse,
} from '@job-assistant/shared';
import { Queue, QueueEvents } from 'bullmq';
import { TimeoutError, withTimeout } from '../lib/with-timeout.js';
import { WorkerTimeoutError } from './system.errors.js';
import { PING_TIMEOUT_MS, SYSTEM_QUEUE_EVENTS } from './system.tokens.js';

/** Round-trip checks through the queue to prove the worker is alive. */
@Injectable()
export class SystemService implements OnApplicationShutdown {
  constructor(
    @InjectQueue(QUEUES.system) private readonly queue: Queue,
    @Inject(SYSTEM_QUEUE_EVENTS) private readonly events: QueueEvents,
    @Inject(PING_TIMEOUT_MS) private readonly timeoutMs: number,
  ) {}

  /**
   * Enqueues a ping job and waits for the worker's answer.
   * Throws WorkerTimeoutError if no answer arrives within the timeout; the stale job is
   * removed (best effort) so pings do not pile up while the worker is down.
   */
  async ping(): Promise<PingResponse> {
    const start = performance.now();
    const data: PingJobData = { sentAt: new Date().toISOString() };
    const job = await this.queue.add(SYSTEM_JOBS.ping, data, {
      attempts: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    });
    try {
      const result = (await withTimeout(
        job.waitUntilFinished(this.events),
        this.timeoutMs,
      )) as PingJobResult;
      return { ...result, roundTripMs: Math.round(performance.now() - start) };
    } catch (error) {
      if (!(error instanceof TimeoutError)) throw error;
      await job.remove().catch(() => undefined);
      throw new WorkerTimeoutError(this.timeoutMs);
    }
  }

  /** Closes the QueueEvents connection; the queue itself is closed by BullModule. */
  async onApplicationShutdown(): Promise<void> {
    await this.events.close();
  }
}
