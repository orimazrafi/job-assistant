import { SYSTEM_JOBS } from '@job-assistant/shared';
import { UnrecoverableError, type Job } from 'bullmq';
import { describe, expect, it } from 'vitest';
import { PingService } from './ping.service.js';
import { SystemProcessor } from './system.processor.js';

/** Minimal stand-in for a BullMQ job; the processor only reads id, name, and data. */
function fakeJob(name: string, data: unknown = {}): Job {
  return { id: '1', name, data } as Job;
}

describe('SystemProcessor', () => {
  const processor = new SystemProcessor(new PingService());

  it('answers a ping job with pong, timestamp, and worker pid', async () => {
    const result = await processor.process(fakeJob(SYSTEM_JOBS.ping, { sentAt: 'now' }));

    expect(result).toEqual({
      pong: true,
      processedAt: expect.any(String),
      workerPid: process.pid,
    });
  });

  it('fails unknown job names permanently so they are not retried', async () => {
    await expect(processor.process(fakeJob('does-not-exist'))).rejects.toBeInstanceOf(
      UnrecoverableError,
    );
  });
});
