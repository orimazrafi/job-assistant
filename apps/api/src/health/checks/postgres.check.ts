import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../infra/tokens.js';
import type { DependencyCheck } from '../dependency-check.js';

/** Healthy when Postgres answers a trivial query. */
@Injectable()
export class PostgresCheck implements DependencyCheck {
  readonly name = 'postgres';

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Runs `SELECT 1`; rejects if the pool cannot connect or query. */
  async check(): Promise<void> {
    await this.pool.query('SELECT 1');
  }
}
