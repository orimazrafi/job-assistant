/** A registered account. Emails are always stored trimmed and lowercase. */
export interface User {
  id: string;
  email: string;
  /** argon2id hash; null for accounts that only sign in with SSO. */
  passwordHash: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Fields needed to create a user; the email is normalized by the repository. */
export interface NewUser {
  email: string;
  passwordHash?: string | null;
  emailVerified?: boolean;
}
