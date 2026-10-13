import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../lib/domain-error.js';

/** Maps DomainError subclasses to `{ statusCode, error, message }` JSON responses. */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  /** Writes the error's HTTP status and a safe message; no stack traces leave the server. */
  catch(error: DomainError, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(error.httpStatus).json({
      statusCode: error.httpStatus,
      error: error.name,
      message: error.message,
    });
  }
}
