import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUES } from '@job-assistant/shared';
import { PingService } from './ping.service.js';
import { SystemProcessor } from './system.processor.js';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.system })],
  providers: [PingService, SystemProcessor],
})
export class SystemModule {}
