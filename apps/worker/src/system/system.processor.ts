import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { QUEUES, SYSTEM_JOBS, type PingJobData } from '@job-assistant/shared';
import { UnrecoverableError, type Job } from 'bullmq';
import { PingService } from './ping.service.js';

/** Consumes the `system` queue and routes each job by name to its service. */
@Processor(QUEUES.system)
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  constructor(private readonly ping: PingService) {
    super();
  }

  /**
   * Called by BullMQ for every job. The return value becomes the job result.
   * Unknown job names fail permanently (no retries) since retrying cannot fix them.
   */
  override async process(job: Job): Promise<unknown> {
    const start = performance.now();
    switch (job.name) {
      case SYSTEM_JOBS.ping: {
        const result = this.ping.handle(job.data as PingJobData);
        this.logger.log(`job=${job.id} name=${job.name} took=${Math.round(performance.now() - start)}ms`);
        return result;
      }
      default:
        throw new UnrecoverableError(`Unknown job name "${job.name}" on queue ${QUEUES.system}`);
    }
  }
}
