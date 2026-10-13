import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from '@job-assistant/shared';
import { QueueEvents } from 'bullmq';
import type { Env } from '../config/env.js';
import { SystemController } from './system.controller.js';
import { SystemService } from './system.service.js';
import { PING_TIMEOUT_MS, SYSTEM_QUEUE_EVENTS } from './system.tokens.js';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.system })],
  controllers: [SystemController],
  providers: [
    SystemService,
    {
      provide: SYSTEM_QUEUE_EVENTS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new QueueEvents(QUEUES.system, {
          connection: { url: config.get('REDIS_URL', { infer: true }) },
        }),
    },
    { provide: PING_TIMEOUT_MS, useValue: 5_000 },
  ],
})
export class SystemModule {}
