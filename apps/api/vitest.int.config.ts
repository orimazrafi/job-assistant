import { defineConfig } from 'vitest/config';

// Integration tests start real databases in Docker via Testcontainers, so they need long timeouts.
export default defineConfig({
  test: {
    include: ['test/**/*.int-spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 180_000,
  },
});
