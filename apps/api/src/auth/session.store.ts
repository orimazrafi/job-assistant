import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS } from '../infra/tokens.js';
import { SESSION_CONFIG } from './auth.tokens.js';
import type { Session, SessionConfig } from './session.js';

/** 32 random bytes in base64url: the only shape a session id can have. */
const SESSION_ID = /^[A-Za-z0-9_-]{43}$/;

/** What Redis holds under `sess:<id>` (the id is the key, not repeated in the value). */
type StoredSession = Omit<Session, 'id'>;

/** Redis key for a session id. */
function key(id: string): string {
  return `sess:${id}`;
}

/**
 * Server-side sessions in Redis (ADR 003). The browser only ever holds the random id.
 * Each key's TTL is the idle timeout, capped by what is left of the absolute lifetime,
 * so Redis deletes sessions on time even if nobody reads them.
 */
@Injectable()
export class SessionStore {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(SESSION_CONFIG) private readonly config: SessionConfig,
  ) {}

  /** Starts a session for `userId` with a new random 256-bit id. */
  async create(userId: string): Promise<Session> {
    const now = Date.now();
    const session: Session = { id: randomBytes(32).toString('base64url'), userId, createdAt: now, lastSeenAt: now };
    await this.redis.set(key(session.id), serialize(session), 'EX', this.ttlSeconds(session, now), 'NX');
    return session;
  }

  /** Returns the session, or null if the id is malformed, unknown, revoked, or past either timeout. */
  async get(id: string): Promise<Session | null> {
    if (!SESSION_ID.test(id)) return null;
    const raw = await this.redis.get(key(id));
    if (!raw) return null;
    const session: Session = { id, ...(JSON.parse(raw) as StoredSession) };
    if (this.ttlSeconds(session, Date.now()) <= 0) {
      await this.destroy(id);
      return null;
    }
    return session;
  }

  /**
   * Records that the session was used now, restarting the idle timeout (never past the absolute
   * limit). Only updates an existing key, so a session revoked meanwhile is not brought back.
   */
  async touch(session: Session): Promise<Session> {
    const now = Date.now();
    const touched: Session = { ...session, lastSeenAt: now };
    const ttl = this.ttlSeconds(touched, now);
    if (ttl <= 0) {
      await this.destroy(session.id);
      return touched;
    }
    await this.redis.set(key(session.id), serialize(touched), 'EX', ttl, 'XX');
    return touched;
  }

  /** Deletes the session (logout or revocation). Unknown ids are ignored. */
  async destroy(id: string): Promise<void> {
    await this.redis.del(key(id));
  }

  /** Seconds the session may still live at `now`: idle time left, capped by absolute time left. */
  private ttlSeconds(session: Session, now: number): number {
    const idleLeft = session.lastSeenAt + this.config.idleTtlSeconds * 1000 - now;
    const absoluteLeft = session.createdAt + this.config.absoluteTtlSeconds * 1000 - now;
    return Math.floor(Math.min(idleLeft, absoluteLeft) / 1000);
  }
}

/** JSON value stored in Redis for a session. */
function serialize(session: Session): string {
  const stored: StoredSession = { userId: session.userId, createdAt: session.createdAt, lastSeenAt: session.lastSeenAt };
  return JSON.stringify(stored);
}
