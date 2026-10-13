-- Up Migration

-- Emails are stored normalized (trimmed, lowercase), so a plain unique constraint
-- makes sign-up case-insensitive: Ori@Gmail.com and ori@gmail.com are one account.
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text,
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_email_normalized CHECK (email = lower(btrim(email)) AND email <> '')
);

COMMENT ON COLUMN users.password_hash IS 'argon2id hash; null for SSO-only accounts';

-- Down Migration

DROP TABLE users;
