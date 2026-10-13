import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupApp } from '../src/app.setup.js';

describe('GET /api/health (real databases)', () => {
  let postgres: StartedPostgreSqlContainer;
  let mongo: StartedMongoDBContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;

  beforeAll(async () => {
    [postgres, mongo, redis] = await Promise.all([
      new PostgreSqlContainer('postgres:17-alpine').start(),
      new MongoDBContainer('mongo:8').start(),
      new RedisContainer('redis:7-alpine').start(),
    ]);
    process.env.DATABASE_URL = postgres.getConnectionUri();
    process.env.MONGO_URL = `${mongo.getConnectionString()}/test?directConnection=true`;
    process.env.REDIS_URL = redis.getConnectionUrl();

    // ConfigModule reads env when AppModule is first imported, so import it after setting env.
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), mongo?.stop(), redis?.stop()]);
  });

  it('returns 200 and every dependency up', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    expect(res.body.status, JSON.stringify(res.body)).toBe('ok');
    expect(res.status).toBe(200);
    for (const name of ['postgres', 'mongo', 'redis']) {
      expect(res.body.checks[name]).toMatchObject({ status: 'up' });
    }
  });

  it('returns 503 and keeps reporting the others when Redis goes down', async () => {
    await redis.stop();

    const res = await request(app.getHttpServer()).get('/api/health').expect(503);

    expect(res.body.status).toBe('degraded');
    expect(res.body.checks.redis.status).toBe('down');
    expect(res.body.checks.postgres.status).toBe('up');
    expect(res.body.checks.mongo.status).toBe('up');
  });
});
