import { Injectable } from '@nestjs/common';
import type { CredentialsRequest, CurrentUserResponse } from '@job-assistant/shared';
import { UsersRepository } from '../users/users.repository.js';
import { InvalidCredentialsError } from './auth.errors.js';
import { AuthService } from './auth.service.js';
import { toCurrentUserResponse } from './current-user-response.js';
import { PasswordHasher } from './password-hasher.js';
import type { Session } from './session.js';

/** A successful sign-up or login: who signed in, and the new session to put in the cookie. */
export interface SignedIn {
  user: CurrentUserResponse;
  session: Session;
}

/** Email and password sign-up and login. Input is already validated by the controller's schema. */
@Injectable()
export class PasswordAuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly auth: AuthService,
  ) {}

  /**
   * Creates an account and signs it in, replacing `previousSessionId` if given.
   * @throws EmailTakenError (409) when the email already has an account.
   */
  async signup(input: CredentialsRequest, previousSessionId?: string): Promise<SignedIn> {
    const user = await this.users.create({ email: input.email, passwordHash: await this.hasher.hash(input.password) });
    const session = await this.auth.startSession(user.id, previousSessionId);
    return { user: toCurrentUserResponse(user), session };
  }

  /**
   * Checks the password and signs the user in with a new session id, replacing `previousSessionId`.
   * Unknown email, SSO-only account, and wrong password all throw the same InvalidCredentialsError
   * after the same amount of hashing work, so neither the message nor the timing reveals which
   * emails are registered.
   */
  async login(input: CredentialsRequest, previousSessionId?: string): Promise<SignedIn> {
    const user = await this.users.findByEmail(input.email);
    const valid = user?.passwordHash
      ? await this.hasher.verify(user.passwordHash, input.password)
      : await this.hasher.verifyDummy(input.password);
    if (!user || !valid) throw new InvalidCredentialsError();

    const session = await this.auth.startSession(user.id, previousSessionId);
    return { user: toCurrentUserResponse(user), session };
  }
}
