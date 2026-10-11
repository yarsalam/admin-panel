// مسیر: apps/server/src/ceo/controllers/ceo-dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/admin/common/guards/roles.guard';
import { Roles } from 'src/admin/common/decorators/roles.decorator';
import { CeoDashboardService } from '../services/ceo-dashboard.service';

@Controller('ceo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'ceo', 'marketing')
export class CeoDashboardController {
  constructor(private readonly ceo: CeoDashboardService) {}

  /**
   * GET /ceo/summary
   * گزارش کامل — همه لایه‌ها
   */
  @Get('summary')
  getSummary() {
    return this.ceo.getSummary();
  }

  /**
   * GET /ceo/kpis
   * فقط KPI های بالای صفحه — برای polling سریع (هر ۶۰ ثانیه)
   */
  @Get('kpis')
  getTopKPIs() {
    return this.ceo.getTopKPIs();
  }
}
