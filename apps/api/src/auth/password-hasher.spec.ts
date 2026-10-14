import { describe, expect, it } from 'vitest';
import { PasswordHasher } from './password-hasher.js';

const hasher = new PasswordHasher();

describe('PasswordHasher', () => {
  it('produces an argon2id PHC string with the OWASP cost parameters', async () => {
    const hash = await hasher.hash('correct horse battery');

    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/);
  });

  it('salts every hash, so the same password hashes differently', async () => {
    expect(await hasher.hash('same password')).not.toBe(await hasher.hash('same password'));
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hasher.hash('correct horse battery');

    expect(await hasher.verify(hash, 'correct horse battery')).toBe(true);
    expect(await hasher.verify(hash, 'correct horse battery!')).toBe(false);
  });

  it('treats a malformed hash as no match instead of throwing', async () => {
    expect(await hasher.verify('not-a-hash', 'anything')).toBe(false);
  });

  it('verifyDummy always returns false', async () => {
    expect(await hasher.verifyDummy('dummy password for timing')).toBe(false);
  });
});
