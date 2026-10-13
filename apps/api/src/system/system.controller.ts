import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { PingResponse } from '@job-assistant/shared';
import { SystemService } from './system.service.js';

@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  /** `POST /api/system/ping`: 200 with the worker's pong, or 504 if the worker does not answer. */
  @Post('ping')
  @HttpCode(HttpStatus.OK)
  ping(): Promise<PingResponse> {
    return this.system.ping();
  }
}
