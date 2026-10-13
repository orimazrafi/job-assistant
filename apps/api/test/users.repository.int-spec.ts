import { randomUUID } from 'node:crypto';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EmailTakenError } from '../src/users/users.errors.js';
import { UsersRepository } from '../src/users/users.repository.js';
import { migrate } from './support/migrate.js';

describe('UsersRepository (real Postgres)', () => {
  let postgres: StartedPostgreSqlContainer;
  let pool: Pool;
  let users: UsersRepository;

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:17-alpine').start();
    await migrate(postgres.getConnectionUri());
    pool = new Pool({ connectionString: postgres.getConnectionUri() });
    users = new UsersRepository(pool);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool?.end();
    await postgres?.stop();
  });

  it('creates a user with defaults and finds it by id', async () => {
    const created = await users.create({ email: 'dana@example.com', passwordHash: 'hash' });

    expect(created).toMatchObject({ email: 'dana@example.com', passwordHash: 'hash', emailVerified: false });
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(await users.findById(created.id)).toEqual(created);
  });

  it('allows SSO-only accounts without a password', async () => {
    const created = await users.create({ email: 'sso@example.com', emailVerified: true });

    expect(created).toMatchObject({ passwordHash: null, emailVerified: true });
  });

  it('stores the email trimmed and lowercase, and finds it in any case', async () => {
    const created = await users.create({ email: '  Ori@Example.COM ' });

    expect(created.email).toBe('ori@example.com');
    expect(await users.findByEmail('ORI@example.com')).toEqual(created);
  });

  it('rejects a second account with the same email in a different case', async () => {
    await users.create({ email: 'taken@example.com' });

    await expect(users.create({ email: 'Taken@Example.com' })).rejects.toBeInstanceOf(EmailTakenError);
  });

  it('lets only one of two concurrent sign-ups with the same email succeed', async () => {
    const results = await Promise.allSettled([
      users.create({ email: 'race@example.com' }),
      users.create({ email: 'race@example.com' }),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((r) => r.status === 'rejected');
    expect(rejected?.reason).toBeInstanceOf(EmailTakenError);
  });

  it('returns null for an unknown email or id', async () => {
    expect(await users.findByEmail('nobody@example.com')).toBeNull();
    expect(await users.findById(randomUUID())).toBeNull();
  });

  it('refuses a non-normalized email even when written without the repository', async () => {
    await expect(pool.query(`INSERT INTO users (email) VALUES ('Mixed@Example.com')`)).rejects.toMatchObject({
      constraint: 'users_email_normalized',
    });
  });

  it('rolls the migrations back and re-applies them cleanly', async () => {
    const tableExists = async () =>
      (await pool.query(`SELECT to_regclass('public.users') AS t`)).rows[0].t !== null;

    await migrate(postgres.getConnectionUri(), 'down');
    expect(await tableExists()).toBe(false);

    await migrate(postgres.getConnectionUri(), 'up');
    expect(await tableExists()).toBe(true);
  });
});
