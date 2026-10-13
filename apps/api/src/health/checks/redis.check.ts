import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS } from '../../infra/tokens.js';
import type { DependencyCheck } from '../dependency-check.js';

/** Healthy when Redis answers `PING`. */
@Injectable()
export class RedisCheck implements DependencyCheck {
  readonly name = 'redis';

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /** Sends `PING`; rejects if Redis is unreachable. */
  async check(): Promise<void> {
    await this.redis.ping();
  }
}
