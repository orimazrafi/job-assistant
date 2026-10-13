import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { Redis } from 'ioredis';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { SessionConfig } from '../src/auth/session.js';
import { SessionStore } from '../src/auth/session.store.js';

const HOUR = 3600;

describe('SessionStore (real Redis)', () => {
  let container: StartedRedisContainer;
  let redis: Redis;

  /** A store with custom lifetimes, so expiry can be tested in seconds. */
  const storeWith = (config: SessionConfig) => new SessionStore(redis, config);
  const ttlOf = (id: string) => redis.ttl(`sess:${id}`);

  beforeAll(async () => {
    container = await new RedisContainer('redis:7-alpine').start();
    redis = new Redis(container.getConnectionUrl());
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis?.quit();
    await container?.stop();
  });

  it('creates a session with a random 256-bit id and reads it back', async () => {
    const store = storeWith({ idleTtlSeconds: HOUR, absoluteTtlSeconds: 2 * HOUR });

    const a = await store.create('user-1');
    const b = await store.create('user-1');

    expect(a.id).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a.id).not.toBe(b.id);
    expect(await store.get(a.id)).toEqual(a);
    expect(await ttlOf(a.id)).toBeGreaterThan(HOUR - 5);
  });

  it('records each visit and restarts the idle timeout', async () => {
    const store = storeWith({ idleTtlSeconds: 60, absoluteTtlSeconds: HOUR });
    const session = await store.create('user-1');
    const later = session.createdAt + 30_000;
    vi.spyOn(Date, 'now').mockReturnValue(later);

    await store.touch(session);

    expect((await store.get(session.id))?.lastSeenAt).toBe(later);
    expect(await ttlOf(session.id)).toBeGreaterThan(55);
  });

  it('expires a session left unused past the idle timeout', async () => {
    const store = storeWith({ idleTtlSeconds: 1, absoluteTtlSeconds: HOUR });
    const session = await store.create('user-1');

    await new Promise((resolve) => setTimeout(resolve, 1_500));

    expect(await store.get(session.id)).toBeNull();
  });

  it('ends a session at the absolute limit even if it is used all the time', async () => {
    const store = storeWith({ idleTtlSeconds: HOUR, absoluteTtlSeconds: 2 * HOUR });
    const session = await store.create('user-1');
    vi.spyOn(Date, 'now').mockReturnValue(session.createdAt + 2 * HOUR * 1000);

    expect(await store.get(session.id)).toBeNull();
    expect(await redis.exists(`sess:${session.id}`)).toBe(0);
  });

  it('never extends a session past the absolute limit', async () => {
    const store = storeWith({ idleTtlSeconds: HOUR, absoluteTtlSeconds: 2 * HOUR });
    const session = await store.create('user-1');
    vi.spyOn(Date, 'now').mockReturnValue(session.createdAt + (2 * HOUR - 100) * 1000);

    await store.touch(session);

    expect(await ttlOf(session.id)).toBeLessThanOrEqual(100);
  });

  it('revokes a session on destroy, and a late touch does not bring it back', async () => {
    const store = storeWith({ idleTtlSeconds: HOUR, absoluteTtlSeconds: 2 * HOUR });
    const session = await store.create('user-1');

    await store.destroy(session.id);
    await store.touch(session);

    expect(await store.get(session.id)).toBeNull();
    expect(await redis.exists(`sess:${session.id}`)).toBe(0);
  });

  it('rejects malformed ids without querying Redis', async () => {
    const store = storeWith({ idleTtlSeconds: HOUR, absoluteTtlSeconds: 2 * HOUR });
    const get = vi.spyOn(redis, 'get');

    expect(await store.get('not-a-session-id')).toBeNull();
    expect(await store.get('*')).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
});
