import { Injectable } from '@nestjs/common';
import type { CurrentUserResponse } from '@job-assistant/shared';
import { UsersRepository } from '../users/users.repository.js';
import { NotAuthenticatedError } from './auth.errors.js';
import type { AuthContext } from './session.js';
import { SessionStore } from './session.store.js';

/** Auth use cases. Sign-up, login, and logout arrive in card 001-03. */
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
    return { id: user.id, email: user.email, emailVerified: user.emailVerified, createdAt: user.createdAt.toISOString() };
  }
}
