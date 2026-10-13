import { describe, expect, it, vi } from 'vitest';
import type { User } from '../users/user.js';
import type { UsersRepository } from '../users/users.repository.js';
import { NotAuthenticatedError } from './auth.errors.js';
import { AuthService } from './auth.service.js';
import type { SessionStore } from './session.store.js';

const user: User = {
  id: 'user-1',
  email: 'dana@example.com',
  passwordHash: 'secret-hash',
  emailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};
const auth = { userId: 'user-1', sessionId: 'session-1' };

/** Service with a fake repository that returns `found`, and a fake session store. */
function setup(found: User | null) {
  const users = { findById: vi.fn().mockResolvedValue(found) };
  const sessions = { destroy: vi.fn().mockResolvedValue(undefined) };
  const service = new AuthService(users as unknown as UsersRepository, sessions as unknown as SessionStore);
  return { users, sessions, service };
}

describe('AuthService.getCurrentUser', () => {
  it('returns the user without the password hash', async () => {
    const { service } = setup(user);

    const res = await service.getCurrentUser(auth);

    expect(res).toEqual({
      id: 'user-1',
      email: 'dana@example.com',
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(res).not.toHaveProperty('passwordHash');
  });

  it('signs out a session whose account no longer exists', async () => {
    const { service, sessions } = setup(null);

    await expect(service.getCurrentUser(auth)).rejects.toBeInstanceOf(NotAuthenticatedError);
    expect(sessions.destroy).toHaveBeenCalledWith('session-1');
  });
});
