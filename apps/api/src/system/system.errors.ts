import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../lib/domain-error.js';

/** The worker did not finish a job in time: it is down, overloaded, or not consuming the queue. */
export class WorkerTimeoutError extends DomainError {
  readonly httpStatus = HttpStatus.GATEWAY_TIMEOUT;

  constructor(timeoutMs: number) {
    super(`Worker did not answer within ${timeoutMs} ms`);
  }
}
