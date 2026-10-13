import type { INestApplication } from '@nestjs/common';

/** Applies app-wide HTTP settings. Shared by `main.ts` and integration tests so both behave the same. */
export function setupApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  return app;
}
