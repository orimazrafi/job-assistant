import { Global, Inject, Injectable, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';
import type { Env } from '../config/env.js';
import { MONGO_CLIENT, PG_POOL, REDIS } from './tokens.js';

const logger = new Logger('InfraModule');

/** Closes all infrastructure clients when the app shuts down, so the process exits cleanly. */
@Injectable()
class InfraShutdown implements OnApplicationShutdown {
  constructor(
    @Inject(PG_POOL) private readonly pg: Pool,
    @Inject(MONGO_CLIENT) private readonly mongo: MongoClient,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  /** Called by Nest on shutdown; errors are ignored because the process is exiting anyway. */
  async onApplicationShutdown(): Promise<void> {
    await Promise.allSettled([this.pg.end(), this.mongo.close(), this.redis.quit()]);
  }
}

/**
 * Composition root for database and cache clients. Global, so feature modules inject
 * clients by token without re-importing. Clients connect lazily, so the API starts
 * even when a dependency is down (the health check reports it instead).
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool({
          connectionString: config.get('DATABASE_URL', { infer: true }),
          max: 10,
          connectionTimeoutMillis: 2_000,
        }),
    },
    {
      provide: MONGO_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new MongoClient(config.get('MONGO_URL', { infer: true }), {
          serverSelectionTimeoutMS: 2_000,
        }),
    },
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const redis = new Redis(config.get('REDIS_URL', { infer: true }), {
          maxRetriesPerRequest: 1,
        });
        // Without a listener, ioredis reports outages as unhandled errors; it reconnects by itself.
        redis.on('error', (error) => logger.warn(`Redis connection error: ${String(error)}`));
        return redis;
      },
    },
    InfraShutdown,
  ],
  exports: [PG_POOL, MONGO_CLIENT, REDIS],
})
export class InfraModule {}
