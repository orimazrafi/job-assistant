import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { NotAuthenticatedError } from './auth.errors.js';
import { clearSessionCookie, readSessionId } from './cookie.js';
import type { AuthContext } from './session.js';
import { SessionStore } from './session.store.js';

/**
 * Protects a route: requires a valid session cookie, restarts the session's idle timeout,
 * and puts `{ userId, sessionId }` on `req.auth`. Otherwise responds 401 and, if the browser
 * sent a dead session id, deletes that cookie.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionStore) {}

  /** Called by Nest before the route handler; throws NotAuthenticatedError instead of returning false. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { auth?: AuthContext }>();

    const sessionId = readSessionId(req.headers.cookie);
    if (!sessionId) throw new NotAuthenticatedError();

    const session = await this.sessions.get(sessionId);
    if (!session) {
      clearSessionCookie(http.getResponse<Response>());
      throw new NotAuthenticatedError();
    }

    await this.sessions.touch(session);
    req.auth = { userId: session.userId, sessionId: session.id };
    return true;
  }
}
