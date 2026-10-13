import type { INestApplication } from '@nestjs/common';
import { DomainErrorFilter } from './http/domain-error.filter.js';

/** Applies app-wide HTTP settings. Shared by `main.ts` and integration tests so both behave the same. */
export function setupApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new DomainErrorFilter());
  app.enableShutdownHooks();
  return app;
}
