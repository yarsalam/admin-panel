import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../admin/common/guards/roles.guard';
import { Roles } from '../../admin/common/decorators/roles.decorator';
import { DashboardService } from '../services/dashboard.service';

@Controller('exec/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'marketing')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis') getKPIs() {
    return this.dashboardService.getKPIs();
  }
  @Get('phase-distribution') getPhaseDistribution() {
    return this.dashboardService.getPhaseDistribution();
  }
  @Get('alerts') getAlerts() {
    return this.dashboardService.getAlerts();
  }
  @Get('competitor-radar') getCompetitorRadar() {
    return this.dashboardService.getCompetitorRadar();
  }
}
