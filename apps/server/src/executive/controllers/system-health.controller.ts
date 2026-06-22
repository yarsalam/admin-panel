import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { SystemHealthService } from '../services/system-health.service';

@Controller('exec/system-health')
@UseGuards(JwtAuthGuard)
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get('metrics') getMetrics() {
    return this.systemHealthService.getSystemMetrics();
  }
  @Get('issues') getIssues() {
    return this.systemHealthService.getIssues();
  }
  @Get('services') getServicesHealth() {
    return this.systemHealthService.getServicesHealth();
  }
  @Get('security') getSecurityReport() {
    return this.systemHealthService.getSecurityReport();
  }
}
