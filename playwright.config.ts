import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// E2E runs the built apps (`pnpm test:e2e` builds first) against real Postgres/MongoDB/Redis
// from docker compose (locally) or service containers (CI).
export default defineConfig({
  testDir: './e2e',
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @job-assistant/api start',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !isCI,
    },
    {
      command: 'pnpm --filter @job-assistant/worker start',
      wait: { stdout: /Worker started/ },
      stdout: 'pipe',
    },
    {
      command: 'pnpm --filter @job-assistant/web preview',
      url: 'http://localhost:4173',
      reuseExistingServer: !isCI,
    },
  ],
});
