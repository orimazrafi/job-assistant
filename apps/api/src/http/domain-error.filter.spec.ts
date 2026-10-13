import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DomainError } from '../lib/domain-error.js';
import { DomainErrorFilter } from './domain-error.filter.js';

class TeapotError extends DomainError {
  readonly httpStatus = 418;
}

/** Builds an ArgumentsHost whose response records status and json calls. */
function fakeHost() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  const host = { switchToHttp: () => ({ getResponse: () => res }) } as unknown as ArgumentsHost;
  return { host, res };
}

describe('DomainErrorFilter', () => {
  it('responds with the error status, name, and message', () => {
    const { host, res } = fakeHost();

    new DomainErrorFilter().catch(new TeapotError('no coffee'), host);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 418,
      error: 'TeapotError',
      message: 'no coffee',
    });
  });
});
