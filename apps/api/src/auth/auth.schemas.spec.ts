// The schemas live in packages/shared (the web form uses them too); they are tested here because
// the API is where they are enforced and packages/shared has no test runner.
import { loginSchema, signupSchema } from '@job-assistant/shared';
import { describe, expect, it } from 'vitest';

describe('signupSchema', () => {
  it('accepts a valid body and trims the email', () => {
    expect(signupSchema.parse({ email: '  Dana@Example.com ', password: 'ten chars!' })).toEqual({
      email: 'Dana@Example.com',
      password: 'ten chars!',
    });
  });

  it('rejects a password shorter than 10 characters with a readable message', () => {
    const result = signupSchema.safeParse({ email: 'dana@example.com', password: 'nine char' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Use at least 10 characters');
  });

  it('rejects a password longer than 128 characters', () => {
    expect(signupSchema.safeParse({ email: 'dana@example.com', password: 'x'.repeat(129) }).success).toBe(false);
  });

  it('rejects an invalid email with a readable message', () => {
    const result = signupSchema.safeParse({ email: 'not-an-email', password: 'long enough password' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a valid email address');
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
