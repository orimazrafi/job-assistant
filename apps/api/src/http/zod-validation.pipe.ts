import { HttpStatus, type PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { DomainError } from '../lib/domain-error.js';

/** The request body, query, or params failed validation. The message lists every problem. */
export class ValidationError extends DomainError {
  readonly httpStatus = HttpStatus.BAD_REQUEST;
}

/**
 * Validates and parses input with a zod schema: `@Body(new ZodValidationPipe(schema)) body`.
 * Returns the parsed value (unknown keys stripped, strings transformed as the schema says),
 * or throws ValidationError (400).
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  /** Called by Nest with the raw argument before the handler runs. */
  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new ValidationError(z.prettifyError(result.error));
    return result.data;
  }
}
