import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

describe('validateEnv (worker)', () => {
  it('accepts a valid REDIS_URL', () => {
    expect(validateEnv({ REDIS_URL: 'redis://localhost:6379' }).REDIS_URL).toBe(
      'redis://localhost:6379',
    );
  });

  it('rejects a missing REDIS_URL', () => {
    expect(() => validateEnv({})).toThrow(/REDIS_URL/);
  });
});
