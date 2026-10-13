import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The browser calls same-origin `/api`; Vite forwards it to the NestJS API.
// Same-origin keeps cookies first-party, which the auth design relies on.
const apiProxy = { '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:3000' };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy: apiProxy },
  preview: { port: 4173, strictPort: true, proxy: apiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
