import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../lib/domain-error.js';

/**
 * Login failed. The same message for an unknown email, a wrong password, or an SSO-only account,
 * so the response doesn't reveal which emails are registered.
 */
export class InvalidCredentialsError extends DomainError {
  readonly httpStatus = HttpStatus.UNAUTHORIZED;

  constructor() {
    super('Invalid email or password');
  }
}

/** No valid session: the cookie is missing, unknown, expired, or revoked. Deliberately says no more. */
export class NotAuthenticatedError extends DomainError {
  readonly httpStatus = HttpStatus.UNAUTHORIZED;

  constructor() {
    super('Not signed in');
  }
}
