import type { PingJobResult } from '@job-assistant/shared';
import type { Queue, QueueEvents } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import { WorkerTimeoutError } from './system.errors.js';
import { SystemService } from './system.service.js';

const pong: PingJobResult = { pong: true, processedAt: '2026-01-01T00:00:00.000Z', workerPid: 42 };

/** Fake queue whose added job finishes with `outcome` (or never, for 'hang'). */
function fakeQueue(outcome: PingJobResult | 'hang' | Error) {
  const waitUntilFinished = vi.fn(() => {
    if (outcome === 'hang') return new Promise(() => {});
    if (outcome instanceof Error) return Promise.reject(outcome);
    return Promise.resolve(outcome);
  });
  const remove = vi.fn().mockResolvedValue(undefined);
  const add = vi.fn().mockResolvedValue({ waitUntilFinished, remove });
  return { queue: { add } as unknown as Queue, add, remove };
}

const events = { close: vi.fn() } as unknown as QueueEvents;

describe('SystemService.ping', () => {
  it('enqueues a ping job and returns the worker result with round-trip time', async () => {
    const { queue, add } = fakeQueue(pong);
    const service = new SystemService(queue, events, 100);

    const res = await service.ping();

    expect(add).toHaveBeenCalledWith('ping', { sentAt: expect.any(String) }, expect.any(Object));
    expect(res).toEqual({ ...pong, roundTripMs: expect.any(Number) });
  });

  it('throws WorkerTimeoutError and removes the stale job when the worker does not answer', async () => {
    const { queue, remove } = fakeQueue('hang');
    const service = new SystemService(queue, events, 20);

    await expect(service.ping()).rejects.toBeInstanceOf(WorkerTimeoutError);
    expect(remove).toHaveBeenCalled();
  });

  it('propagates a job failure as-is', async () => {
    const service = new SystemService(fakeQueue(new Error('boom')).queue, events, 100);

    await expect(service.ping()).rejects.toThrow('boom');
  });
});
