import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

/** Starts the worker as a Nest application context (no HTTP server); processors start consuming queues. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  Logger.log('Worker started, consuming queues', 'Bootstrap');
}

await bootstrap();
