import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import request, { type Response } from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupApp } from '../src/app.setup.js';
import { SESSION_COOKIE } from '../src/auth/cookie.js';
import { UsersRepository } from '../src/users/users.repository.js';
import { migrate } from './support/migrate.js';

const PASSWORD = 'correct horse battery';

describe('sign-up, login, logout (real databases)', () => {
  let postgres: StartedPostgreSqlContainer;
  let mongo: StartedMongoDBContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let users: UsersRepository;

  /** Sends a POST with a JSON body, and the session cookie when an id is given. */
  const post = (path: string, body?: object, sessionId?: string) => {
    const req = request(app.getHttpServer()).post(`/api/auth/${path}`);
    if (sessionId) req.set('Cookie', `${SESSION_COOKIE}=${sessionId}`);
    return body ? req.send(body) : req;
  };

  /** Sends GET /api/auth/me with the session cookie. */
  const me = (sessionId: string) =>
    request(app.getHttpServer()).get('/api/auth/me').set('Cookie', `${SESSION_COOKIE}=${sessionId}`);

  /** The `Set-Cookie` header for the session cookie, or undefined. */
  const sessionCookie = (res: Response): string | undefined =>
    ([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  /** The session id a response set. Fails the test if there is none. */
  const sessionIdFrom = (res: Response): string => {
    const id = /^[^=]+=([^;]*)/.exec(sessionCookie(res) ?? '')?.[1];
    if (!id) throw new Error('response did not set a session cookie');
    return id;
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
    users = app.get(UsersRepository);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), mongo?.stop(), redis?.stop()]);
  });

  it('signs up: 201, a secure session cookie, an argon2id hash in Postgres, and /me works', async () => {
    const res = await post('signup', { email: ' New.User@Example.com ', password: PASSWORD }).expect(201);

    expect(res.body).toMatchObject({ email: 'new.user@example.com', emailVerified: false });
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(sessionCookie(res)).toMatch(/; HttpOnly/);
    expect(sessionCookie(res)).toMatch(/; Secure/);
    expect(sessionCookie(res)).toMatch(/; SameSite=Lax/);
    const stored = await users.findByEmail('new.user@example.com');
    expect(stored?.passwordHash).toMatch(/^\$argon2id\$/);
    await me(sessionIdFrom(res)).expect(200);
  });

  it('rejects a duplicate email with 409, whatever its case', async () => {
    await post('signup', { email: 'taken@example.com', password: PASSWORD }).expect(201);

    const res = await post('signup', { email: 'TAKEN@example.com', password: PASSWORD }).expect(409);

    expect(res.body).toEqual({
      statusCode: 409,
      error: 'EmailTakenError',
      message: 'An account with this email already exists',
    });
    expect(sessionCookie(res)).toBeUndefined();
  });

  it('rejects an invalid body with 400 and creates nothing', async () => {
    const res = await post('signup', { email: 'short@example.com', password: 'too short' }).expect(400);

    expect(res.body).toMatchObject({ statusCode: 400, error: 'ValidationError' });
    expect(res.body.message).toMatch(/password/);
    expect(await users.findByEmail('short@example.com')).toBeNull();
    await post('signup').expect(400);
  });

  it('logs in with a new session id and ends the session the browser had before', async () => {
    const signup = await post('signup', { email: 'rotate@example.com', password: PASSWORD }).expect(201);
    const before = sessionIdFrom(signup);

    const login = await post('login', { email: 'rotate@example.com', password: PASSWORD }, before).expect(200);

    const after = sessionIdFrom(login);
    expect(after).not.toBe(before);
    expect(login.body).toMatchObject({ email: 'rotate@example.com' });
    await me(after).expect(200);
    await me(before).expect(401);
  });

  it('answers a wrong password and an unknown email with the same 401', async () => {
    await post('signup', { email: 'dana@example.com', password: PASSWORD }).expect(201);

    const wrongPassword = await post('login', { email: 'dana@example.com', password: 'wrong password' }).expect(401);
    const unknownEmail = await post('login', { email: 'nobody@example.com', password: PASSWORD }).expect(401);

    const expected = { statusCode: 401, error: 'InvalidCredentialsError', message: 'Invalid email or password' };
    expect(wrongPassword.body).toEqual(expected);
    expect(unknownEmail.body).toEqual(expected);
    expect(sessionCookie(wrongPassword)).toBeUndefined();
  });

  it('rejects login for an SSO-only account (no password) with the same 401', async () => {
    await users.create({ email: 'sso@example.com', emailVerified: true });

    const res = await post('login', { email: 'sso@example.com', password: PASSWORD }).expect(401);

    expect(res.body.error).toBe('InvalidCredentialsError');
  });

  it('logs out: 204, the cookie is deleted, and the session no longer works', async () => {
    const signup = await post('signup', { email: 'bye@example.com', password: PASSWORD }).expect(201);
    const sessionId = sessionIdFrom(signup);

    const res = await post('logout', undefined, sessionId).expect(204);

    expect(sessionCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);
    await me(sessionId).expect(401);
  });

  it('logout without a session is still 204, so it is safe to repeat', async () => {
    await post('logout').expect(204);
  });
});
