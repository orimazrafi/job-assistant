import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../infra/tokens.js';
import type { NewUser, User } from './user.js';
import { EmailTakenError } from './users.errors.js';

const USER_COLUMNS = 'id, email, password_hash, email_verified, created_at, updated_at';
const UNIQUE_VIOLATION = '23505';

/** Row shape returned by `SELECT ${USER_COLUMNS}`. */
interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

/** Postgres access for the `users` table. Returns domain `User` objects, never rows. */
@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Finds a user by email, ignoring case and surrounding spaces. Returns null if none. */
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [
      normalizeEmail(email),
    ]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  /** Finds a user by id. Returns null if none. */
  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  /**
   * Inserts a user with a normalized email.
   * @throws EmailTakenError when the email already has an account (the unique constraint decides, so
   *   concurrent sign-ups with the same email cannot both succeed).
   */
  async create(input: NewUser): Promise<User> {
    try {
      const { rows } = await this.pool.query<UserRow>(
        `INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3) RETURNING ${USER_COLUMNS}`,
        [normalizeEmail(input.email), input.passwordHash ?? null, input.emailVerified ?? false],
      );
      return toUser(rows[0]!);
    } catch (error) {
      if (isUniqueViolation(error, 'users_email_key')) throw new EmailTakenError();
      throw error;
    }
  }
}

/** Trims and lowercases an email; must match the `users_email_normalized` check constraint. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Maps a snake_case row to the domain type. */
function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    emailVerified: row.email_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** True if `error` is a Postgres unique violation on the given constraint. */
function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { code, constraint: violated } = error as { code?: unknown; constraint?: unknown };
  return code === UNIQUE_VIOLATION && violated === constraint;
}
