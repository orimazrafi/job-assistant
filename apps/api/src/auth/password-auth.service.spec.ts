import { describe, expect, it, vi } from 'vitest';
import type { User } from '../users/user.js';
import { EmailTakenError } from '../users/users.errors.js';
import type { UsersRepository } from '../users/users.repository.js';
import { InvalidCredentialsError } from './auth.errors.js';
import type { AuthService } from './auth.service.js';
import { PasswordAuthService } from './password-auth.service.js';
import type { PasswordHasher } from './password-hasher.js';

const user: User = {
  id: 'user-1',
  email: 'dana@example.com',
  passwordHash: 'stored-hash',
  emailVerified: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const session = { id: 'new-session', userId: 'user-1', createdAt: 0, lastSeenAt: 0 };
const credentials = { email: 'dana@example.com', password: 'correct horse battery' };

/** Service with fakes: the repository finds `found`, and the hasher's verify returns `matches`. */
function setup({ found = user as User | null, matches = true } = {}) {
  const users = { create: vi.fn().mockResolvedValue(user), findByEmail: vi.fn().mockResolvedValue(found) };
  const hasher = {
    hash: vi.fn().mockResolvedValue('new-hash'),
    verify: vi.fn().mockResolvedValue(matches),
    verifyDummy: vi.fn().mockResolvedValue(false),
  };
  const auth = { startSession: vi.fn().mockResolvedValue(session) };
  const service = new PasswordAuthService(
    users as unknown as UsersRepository,
    hasher as unknown as PasswordHasher,
    auth as unknown as AuthService,
  );
  return { users, hasher, auth, service };
}

describe('PasswordAuthService.signup', () => {
  it('stores only the hash and signs the new user in, replacing the previous session', async () => {
    const { service, users, hasher, auth } = setup();

    const res = await service.signup(credentials, 'old-session');

    expect(hasher.hash).toHaveBeenCalledWith('correct horse battery');
    expect(users.create).toHaveBeenCalledWith({ email: 'dana@example.com', passwordHash: 'new-hash' });
    expect(auth.startSession).toHaveBeenCalledWith('user-1', 'old-session');
    expect(res).toEqual({
      user: { id: 'user-1', email: 'dana@example.com', emailVerified: false, createdAt: '2026-01-01T00:00:00.000Z' },
      session,
    });
  });

  it('does not start a session when the email is taken', async () => {
    const { service, users, auth } = setup();
    users.create.mockRejectedValue(new EmailTakenError());

    await expect(service.signup(credentials)).rejects.toBeInstanceOf(EmailTakenError);
    expect(auth.startSession).not.toHaveBeenCalled();
  });
});

describe('PasswordAuthService.login', () => {
  it('signs in with a new session when the password matches', async () => {
    const { service, hasher, auth } = setup();

    const res = await service.login(credentials, 'old-session');

    expect(hasher.verify).toHaveBeenCalledWith('stored-hash', 'correct horse battery');
    expect(auth.startSession).toHaveBeenCalledWith('user-1', 'old-session');
    expect(res.session).toBe(session);
    expect(res.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password without starting a session', async () => {
    const { service, auth } = setup({ matches: false });

    await expect(service.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(auth.startSession).not.toHaveBeenCalled();
  });

  it('rejects an unknown email after doing the same hashing work', async () => {
    const { service, hasher, auth } = setup({ found: null });

    await expect(service.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(hasher.verifyDummy).toHaveBeenCalledWith('correct horse battery');
    expect(auth.startSession).not.toHaveBeenCalled();
  });

  it('rejects an SSO-only account (no password) the same way', async () => {
    const { service, hasher, auth } = setup({ found: { ...user, passwordHash: null } });

    await expect(service.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(hasher.verify).not.toHaveBeenCalled();
    expect(hasher.verifyDummy).toHaveBeenCalled();
    expect(auth.startSession).not.toHaveBeenCalled();
  });
});
