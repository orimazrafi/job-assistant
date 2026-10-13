import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupApp } from '../src/app.setup.js';
import { SESSION_COOKIE } from '../src/auth/cookie.js';
import { SessionStore } from '../src/auth/session.store.js';
import { UsersRepository } from '../src/users/users.repository.js';
import { migrate } from './support/migrate.js';

describe('GET /api/auth/me (real databases)', () => {
  let postgres: StartedPostgreSqlContainer;
  let mongo: StartedMongoDBContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let sessions: SessionStore;
  let users: UsersRepository;

  /** Sends GET /api/auth/me, with the session cookie when an id is given. */
  const me = (sessionId?: string) => {
    const req = request(app.getHttpServer()).get('/api/auth/me');
    return sessionId ? req.set('Cookie', `${SESSION_COOKIE}=${sessionId}`) : req;
  };

  beforeAll(async () => {
    [postgres, mongo, redis] = await Promise.all([
      new PostgreSqlContainer('postgres:17-alpine').start(),
      new MongoDBContainer('mongo:8').start(),
      new RedisContainer('redis:7-alpine').start(),
    ]);
    process.env.DATABASE_URL = postgres.getConnectionUri();
    process.env.MONGO_URL = `${mongo.getConnectionString()}/test?directConnection=true`;
    process.env.REDIS_URL = redis.getConnectionUrl();
    await migrate(postgres.getConnectionUri());

    // ConfigModule reads env when AppModule is first imported, so import it after setting env.
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
    sessions = app.get(SessionStore);
    users = app.get(UsersRepository);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), mongo?.stop(), redis?.stop()]);
  });

  it('returns 401 without a session cookie', async () => {
    const res = await me().expect(401);

    expect(res.body).toEqual({ statusCode: 401, error: 'NotAuthenticatedError', message: 'Not signed in' });
  });

  it('returns the signed-in user, without secrets, for a valid session', async () => {
    const user = await users.create({ email: 'dana@example.com', passwordHash: 'secret-hash' });
    const session = await sessions.create(user.id);

    const res = await me(session.id).expect(200);

    expect(res.body).toEqual({
      id: user.id,
      email: 'dana@example.com',
      emailVerified: false,
      createdAt: user.createdAt.toISOString(),
    });
  });

  it('returns 401 and deletes the cookie for a revoked session', async () => {
    const user = await users.create({ email: 'revoked@example.com' });
    const session = await sessions.create(user.id);
    await sessions.destroy(session.id);

    const res = await me(session.id).expect(401);

    expect(String(res.headers['set-cookie'])).toMatch(new RegExp(`^${SESSION_COOKIE}=;.*Expires=Thu, 01 Jan 1970`));
  });

  it('returns 401 for an unknown session id', async () => {
    await me('x'.repeat(43)).expect(401);
  });
});
