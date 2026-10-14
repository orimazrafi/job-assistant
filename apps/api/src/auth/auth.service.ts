import { Injectable } from '@nestjs/common';
import type { CurrentUserResponse } from '@job-assistant/shared';
import { UsersRepository } from '../users/users.repository.js';
import { NotAuthenticatedError } from './auth.errors.js';
import { toCurrentUserResponse } from './current-user-response.js';
import type { AuthContext, Session } from './session.js';
import { SessionStore } from './session.store.js';

/** Session use cases shared by every sign-in method (password now, SSO later). */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly sessions: SessionStore,
  ) {}

  /**
   * Returns the signed-in user without secrets. If the account no longer exists, the session
   * is destroyed and the caller is treated as signed out.
   */
  async getCurrentUser(auth: AuthContext): Promise<CurrentUserResponse> {
    const user = await this.users.findById(auth.userId);
    if (!user) {
      await this.sessions.destroy(auth.sessionId);
      throw new NotAuthenticatedError();
    }
    return toCurrentUserResponse(user);
  }

  /**
   * Signs `userId` in with a brand-new session id, destroying the browser's previous session if
   * it sent one. A fresh id on every sign-in prevents session fixation: an id an attacker
   * planted before login is never the one that becomes signed in.
   */
  async startSession(userId: string, previousSessionId?: string): Promise<Session> {
    if (previousSessionId) await this.sessions.destroy(previousSessionId);
    return this.sessions.create(userId);
  }

  /** Ends the session. Idempotent: an unknown or already-ended id is not an error. */
  async logout(sessionId: string): Promise<void> {
    await this.sessions.destroy(sessionId);
  }
}
