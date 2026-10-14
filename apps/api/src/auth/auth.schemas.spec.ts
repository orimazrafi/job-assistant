import { describe, expect, it } from 'vitest';
import { loginSchema, signupSchema } from './auth.schemas.js';

describe('signupSchema', () => {
  it('accepts a valid body and trims the email', () => {
    expect(signupSchema.parse({ email: '  Dana@Example.com ', password: 'ten chars!' })).toEqual({
      email: 'Dana@Example.com',
      password: 'ten chars!',
    });
  });

  it('rejects a password shorter than 10 characters', () => {
    expect(signupSchema.safeParse({ email: 'dana@example.com', password: 'nine char' }).success).toBe(false);
  });

  it('rejects a password longer than 128 characters', () => {
    expect(signupSchema.safeParse({ email: 'dana@example.com', password: 'x'.repeat(129) }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(signupSchema.safeParse({ email: 'not-an-email', password: 'long enough password' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a short password, which login then rejects as wrong credentials', () => {
    expect(loginSchema.safeParse({ email: 'dana@example.com', password: 'short' }).success).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'dana@example.com', password: '' }).success).toBe(false);
  });
});
