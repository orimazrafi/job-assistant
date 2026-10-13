import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../lib/domain-error.js';

/** Sign-up with an email that already has an account (compared case-insensitively). */
export class EmailTakenError extends DomainError {
  readonly httpStatus = HttpStatus.CONFLICT;

  constructor() {
    super('An account with this email already exists');
  }
}
