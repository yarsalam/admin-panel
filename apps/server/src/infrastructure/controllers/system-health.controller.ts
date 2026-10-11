import { Controller, Get } from '@nestjs/common';
import { SystemHealthService } from '../services/system-health.service';

@Controller('infrastructure/system-health')
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get('overview')
  getOverview() {
    return this.systemHealthService.getOverview();
  }

  @Get('services-status')
  getServicesStatus() {
    return this.systemHealthService.getServicesStatus();
  }
}
