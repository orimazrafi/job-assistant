import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));

/**
 * Applies (`up`) or rolls back (`down`) all migrations, the same files and tracking table
 * (`pgmigrations`, the CLI default) that `pnpm db:migrate` uses. Output is silenced.
 */
export async function migrate(databaseUrl: string, direction: 'up' | 'down' = 'up'): Promise<void> {
  await runner({
    databaseUrl,
    dir: MIGRATIONS_DIR,
    migrationsTable: 'pgmigrations',
    direction,
    count: Infinity,
    log: () => undefined,
  });
}
