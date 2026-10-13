import { Injectable } from '@nestjs/common';
import type { PingJobData, PingJobResult } from '@job-assistant/shared';

/** Answers ping jobs; proves the worker is alive and consuming the queue. */
@Injectable()
export class PingService {
  /** Returns a pong with the processing time and this worker's process id. */
  handle(_data: PingJobData): PingJobResult {
    return { pong: true, processedAt: new Date().toISOString(), workerPid: process.pid };
  }
}
