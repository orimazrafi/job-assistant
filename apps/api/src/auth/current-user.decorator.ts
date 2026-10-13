import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthContext, AuthenticatedRequest } from './session.js';

/**
 * Route parameter decorator: `@CurrentUser() auth: AuthContext` gives the signed-in user's id
 * and session id. Only valid on routes protected by SessionGuard; throws otherwise, so a missing
 * guard fails loudly instead of acting as an anonymous user.
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthContext => {
  const req = context.switchToHttp().getRequest<Partial<AuthenticatedRequest>>();
  if (!req.auth) throw new Error('@CurrentUser() used on a route without SessionGuard');
  return req.auth;
});
