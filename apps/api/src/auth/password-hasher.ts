import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

/**
 * argon2id cost (OWASP minimum: 19 MiB memory, 2 passes, 1 lane), tens of milliseconds per hash.
 * Stored in each hash string, so raising it later only affects new hashes (ADR 007).
 */
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

/** Hashes and verifies passwords with argon2id (the library's default algorithm). */
@Injectable()
export class PasswordHasher {
  private dummyHash: Promise<string> | undefined;

  /** Returns a PHC string (`$argon2id$v=19$m=...$salt$hash`) with a fresh random salt. */
  hash(password: string): Promise<string> {
    return hash(password, ARGON2_OPTIONS);
  }

  /** True if `password` matches `passwordHash`. A malformed hash counts as no match. */
  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  /**
   * Spends the same time as a real verify, for logins whose account doesn't exist or has no
   * password, so response time doesn't reveal which emails are registered. Always false.
   */
  async verifyDummy(password: string): Promise<false> {
    this.dummyHash ??= this.hash('dummy password for timing');
    await this.verify(await this.dummyHash, password);
    return false;
  }
}
