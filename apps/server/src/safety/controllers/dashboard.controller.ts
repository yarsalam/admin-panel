import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';

@Controller('safety/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getFullDashboard() {
    return this.dashboardService.getFullDashboard();
  }

  @Get('tickets')
  getTicketKPIs() {
    return this.dashboardService.getTicketKPIs();
  }

  @Get('ai-insights')
  getAiInsights() {
    return this.dashboardService.getAiInsights();
  }
}
