import { expect, test, type Page } from '@playwright/test';

// The whole email account journey in a real browser against the real API, Postgres, and Redis.
// A unique email per run, because the database is not reset between runs.

const password = 'correct horse battery';

/** Fills the email and password form and submits it with `button`. */
async function submitCredentials(page: Page, email: string, button: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: button }).click();
}

test('sign up, log out, log in, stay logged in after a refresh, log out', async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole('link', { name: 'Create one' }).click();
  await submitCredentials(page, email, 'Create account');
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

  await submitCredentials(page, email, 'Log in');
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.reload();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('a failed login shows the generic error', async ({ page }) => {
  await page.goto('/login');

  await submitCredentials(page, 'nobody@example.com', 'Log in');

  await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
});
