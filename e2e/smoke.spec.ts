import { expect, test } from '@playwright/test';

// The smoke test answers one question: does the whole app actually work?
// It grows with every feature slice.

test('status page shows every dependency up', async ({ page }) => {
  await page.goto('/status');

  await expect(page.getByText('Overall:')).toContainText('ok');
  for (const name of ['postgres', 'mongo', 'redis']) {
    await expect(page.getByRole('listitem').filter({ hasText: name })).toContainText('up');
  }
});

test('worker answers a ping through the queue', async ({ page }) => {
  await page.goto('/status');

  await page.getByRole('button', { name: 'Ping worker' }).click();

  await expect(page.getByText(/Worker answered in \d+ ms\./)).toBeVisible({ timeout: 10_000 });
});
