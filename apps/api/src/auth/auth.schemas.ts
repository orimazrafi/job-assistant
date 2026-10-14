import type { CredentialsRequest } from '@job-assistant/shared';
import { z } from 'zod';

/** Password policy from spec 001: at least 10 characters. The upper bound limits hashing cost. */
const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;

/** Trimmed before the format check; the repository lowercases it. 254 is the longest valid address. */
const email = z.string().trim().pipe(z.email().max(254));

/** Body of `POST /api/auth/signup`. */
export const signupSchema = z.object({
  email,
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
}) satisfies z.ZodType<CredentialsRequest>;

/**
 * Body of `POST /api/auth/login`. No minimum length: a short password is simply wrong, and a
 * different error for it would only add noise.
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(PASSWORD_MAX),
}) satisfies z.ZodType<CredentialsRequest>;
