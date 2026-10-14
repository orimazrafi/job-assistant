import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../src/app.setup.js';

describe('queue dashboard at /api/queues (real Redis)', () => {
  let redis: StartedRedisContainer;
  let app: INestApplication | undefined;

  /**
   * Boots the whole API with the given NODE_ENV and dashboard flag. Both are always set, because
   * ConfigModule fills unset variables from the developer's `.env`. The "unset means off" default
   * is covered by the unit test of `dashboardEnabled`. Modules are reset first because the
   * dashboard decides whether to mount when AppModule is imported.
   */
  async function startApp(nodeEnv: string, dashboardFlag: 'true' | 'false'): Promise<INestApplication> {
    process.env.NODE_ENV = nodeEnv;
    process.env.QUEUE_DASHBOARD_ENABLED = dashboardFlag;
    vi.resetModules();
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
    return app;
  }

  beforeAll(async () => {
    redis = await new RedisContainer('redis:7-alpine').start();
    process.env.REDIS_URL = redis.getConnectionUrl();
    // Postgres and MongoDB clients connect lazily and these tests never query them.
    process.env.DATABASE_URL = 'postgres://unused:unused@localhost:1/unused';
    process.env.MONGO_URL = 'mongodb://localhost:1/unused';
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  afterAll(async () => {
    await redis?.stop();
  });

  it('serves the dashboard and lists the system queue when enabled in development', async () => {
    const server = (await startApp('development', 'true')).getHttpServer();

    const page = await request(server).get('/api/queues').expect(200);
    expect(page.text).toContain('<title>Bull Dashboard</title>');

    const queues = await request(server).get('/api/queues/api/queues').expect(200);
    expect(queues.body.queues.map((q: { name: string }) => q.name)).toEqual(['system']);
  });

  it('keeps the dashboard off when the flag is false', async () => {
    const server = (await startApp('development', 'false')).getHttpServer();

    await request(server).get('/api/queues').expect(404);
  });

  it('never mounts the dashboard in production, even with the flag on', async () => {
    const server = (await startApp('production', 'true')).getHttpServer();

    await request(server).get('/api/queues').expect(404);
    await request(server).get('/api/health').expect((res) => expect(res.status).not.toBe(404));
  });
});
