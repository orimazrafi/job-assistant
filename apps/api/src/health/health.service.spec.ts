import { describe, expect, it } from 'vitest';
import type { DependencyCheck } from './dependency-check.js';
import { HealthService } from './health.service.js';

/** Builds a fake check that resolves, rejects, or never settles. */
function fakeCheck(name: string, behavior: 'up' | 'fail' | 'hang'): DependencyCheck {
  return {
    name,
    check: () => {
      if (behavior === 'up') return Promise.resolve();
      if (behavior === 'fail') return Promise.reject(new Error('ECONNREFUSED 10.0.0.5:5432'));
      return new Promise<void>(() => {});
    },
  };
}

describe('HealthService', () => {
  it('reports ok when every check is up', async () => {
    const service = new HealthService([fakeCheck('postgres', 'up'), fakeCheck('redis', 'up')], 50);

    const report = await service.getReport();

    expect(report.status).toBe('ok');
    expect(report.checks.postgres).toEqual({ status: 'up', latencyMs: expect.any(Number) });
    expect(report.checks.redis?.status).toBe('up');
  });

  it('reports degraded and keeps other results when one check fails', async () => {
    const service = new HealthService([fakeCheck('postgres', 'fail'), fakeCheck('redis', 'up')], 50);

    const report = await service.getReport();

    expect(report.status).toBe('degraded');
    expect(report.checks.postgres).toMatchObject({ status: 'down', error: 'unavailable' });
    expect(report.checks.redis?.status).toBe('up');
  });

  it('does not leak driver error details', async () => {
    const service = new HealthService([fakeCheck('postgres', 'fail')], 50);

    const report = await service.getReport();

    expect(JSON.stringify(report)).not.toContain('10.0.0.5');
  });

  it('marks a slow check as down with a timeout', async () => {
    const service = new HealthService([fakeCheck('mongo', 'hang')], 20);

    const report = await service.getReport();

    expect(report.checks.mongo).toMatchObject({ status: 'down', error: 'timeout' });
  });
});
