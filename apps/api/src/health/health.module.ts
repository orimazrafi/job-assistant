import { Module } from '@nestjs/common';
import { MongoCheck } from './checks/mongo.check.js';
import { PostgresCheck } from './checks/postgres.check.js';
import { RedisCheck } from './checks/redis.check.js';
import { DEPENDENCY_CHECKS, HEALTH_CHECK_TIMEOUT_MS } from './dependency-check.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  controllers: [HealthController],
  providers: [
    PostgresCheck,
    MongoCheck,
    RedisCheck,
    {
      provide: DEPENDENCY_CHECKS,
      inject: [PostgresCheck, MongoCheck, RedisCheck],
      useFactory: (...checks: [PostgresCheck, MongoCheck, RedisCheck]) => checks,
    },
    { provide: HEALTH_CHECK_TIMEOUT_MS, useValue: 2_000 },
    HealthService,
  ],
})
export class HealthModule {}
