import { describe, expect, it } from 'vitest';
import { dashboardEnabled } from './queue-dashboard.module.js';

const baseEnv = {
  DATABASE_URL: 'postgres://job:job@localhost:5432/job_assistant',
  MONGO_URL: 'mongodb://localhost:27017/job_assistant',
  REDIS_URL: 'redis://localhost:6379',
};

describe('dashboardEnabled (fail-closed)', () => {
  it('is off when the flag is not set', () => {
    expect(dashboardEnabled({ ...baseEnv, NODE_ENV: 'development' })).toBe(false);
  });

  it('is off when NODE_ENV is not set either', () => {
    expect(dashboardEnabled(baseEnv)).toBe(false);
  });

  it('is on only when the flag is true outside production', () => {
    expect(dashboardEnabled({ ...baseEnv, NODE_ENV: 'development', QUEUE_DASHBOARD_ENABLED: 'true' })).toBe(true);
  });

  it('is off in production even when the flag is true', () => {
    expect(dashboardEnabled({ ...baseEnv, NODE_ENV: 'production', QUEUE_DASHBOARD_ENABLED: 'true' })).toBe(false);
  });
});
