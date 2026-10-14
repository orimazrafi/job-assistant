import { z } from 'zod';

/** Password policy from spec 001: at least 10 characters. The upper bound limits hashing cost on the API. */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** Trimmed before the format check; the API lowercases it. 254 is the longest valid address. */
const email = z
  .string()
  .trim()
  .pipe(z.email('Enter a valid email address').max(254, 'Email is too long'));

/**
 * Body of `POST /api/auth/signup`. The API enforces it (ZodValidationPipe); the web form uses the
 * same schema so both sides apply the same rules and messages.
 */
export const signupSchema = z.object({
  email,
  password: z
    .string()
    .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Use at most ${PASSWORD_MAX} characters`),
});

/**
 * Body of `POST /api/auth/login`. No minimum length: a short password is simply wrong, and a
 * different error for it would only add noise.
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX, `Use at most ${PASSWORD_MAX} characters`),
});

/** Request body of `POST /api/auth/signup` and `POST /api/auth/login`, after validation. */
export type CredentialsRequest = z.output<typeof signupSchema>;

/** Response body of `GET /api/auth/me`, signup, and login: the signed-in user, without secrets. */
export interface CurrentUserResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}
