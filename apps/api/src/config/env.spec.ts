import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

const validEnv = {
  DATABASE_URL: 'postgres://job:job@localhost:5432/job_assistant',
  MONGO_URL: 'mongodb://localhost:27017/job_assistant',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  it('accepts a valid env and applies defaults', () => {
    const env = validateEnv(validEnv);
    expect(env.API_PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('coerces API_PORT from a string', () => {
    expect(validateEnv({ ...validEnv, API_PORT: '4000' }).API_PORT).toBe(4000);
  });

  it('rejects a missing variable with its name in the message', () => {
    const { REDIS_URL: _omitted, ...withoutRedis } = validEnv;
    expect(() => validateEnv(withoutRedis)).toThrow(/REDIS_URL/);
  });
});
