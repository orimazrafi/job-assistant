import type { CurrentUserResponse } from '@job-assistant/shared';
import type { User } from '../users/user.js';

/** The user as the API returns it: no password hash, dates as ISO strings. */
export function toCurrentUserResponse(user: User): CurrentUserResponse {
  return { id: user.id, email: user.email, emailVerified: user.emailVerified, createdAt: user.createdAt.toISOString() };
}
