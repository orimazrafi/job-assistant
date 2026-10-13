import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { HealthReport } from '@job-assistant/shared';
import type { Response } from 'express';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** `GET /api/health`: 200 when all dependencies are up, 503 when any is down. */
  @Get()
  async get(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const report = await this.health.getReport();
    res.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
