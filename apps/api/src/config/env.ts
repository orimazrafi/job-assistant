import { z } from 'zod';

const DAY_SECONDS = 24 * 60 * 60;

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    MONGO_URL: z.url(),
    REDIS_URL: z.url(),
    // Spec 001: a session ends after 7 days without use or 30 days after login.
    SESSION_IDLE_TTL_SECONDS: z.coerce.number().int().positive().default(7 * DAY_SECONDS),
    SESSION_ABSOLUTE_TTL_SECONDS: z.coerce.number().int().positive().default(30 * DAY_SECONDS),
  })
  .refine((env) => env.SESSION_ABSOLUTE_TTL_SECONDS >= env.SESSION_IDLE_TTL_SECONDS, {
    path: ['SESSION_ABSOLUTE_TTL_SECONDS'],
    message: 'must be at least SESSION_IDLE_TTL_SECONDS',
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Validates raw environment variables at startup (used by ConfigModule).
 * Throws a readable error listing every invalid or missing variable, which stops the app.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
