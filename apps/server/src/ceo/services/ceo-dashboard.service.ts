// مسیر: apps/server/src/ceo/services/ceo-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { IntelligenceService } from 'src/executive/intelligence/services/intelligence.service';
import { CeoSummaryDto, CeoTopKPIsDto } from '../dto/ceo-dashboard.dto';

/**
 * CeoDashboardService
 * ────────────────────
 * فقط Presenter — هیچ منطق کسب‌وکاری ندارد.
 * intelligenceService.getFullReport() را می‌خواند و شکل خروجی را می‌چرخاند.
 */
@Injectable()
export class CeoDashboardService {
  constructor(private readonly intelligence: IntelligenceService) {}

  async getSummary(): Promise<CeoSummaryDto> {
    const report = await this.intelligence.getFullReport();
    return {
      executiveSummary: report.executiveSummary,
      businessScore: report.businessScore,
      femaleMetrics: report.femaleMetrics,
      growth: report.growth,
      funnel: report.funnel,
      matchHealth: report.matchHealth,
      safety: report.safety,
      segments: report.segments,
      revenue: report.revenue,
      alerts: report.alerts,
      recommendations: report.recommendations,
      generatedAt: report.generatedAt,
    };
  }

  async getTopKPIs(): Promise<CeoTopKPIsDto> {
    const report = await this.intelligence.getFullReport();
    return {
      femaleActiveUsers: report.femaleMetrics.femaleActiveUsers,
      femaleRatio: report.femaleMetrics.femaleRatio,
      femaleHealthScore: report.femaleMetrics.healthScore,
      dau: report.growth.dau.current,
      matchRate: report.matchHealth.matchRate.current,
      businessScore: report.businessScore.total,
      criticalAlerts: report.alerts.filter((a) => a.severity === 'critical').length,
      generatedAt: report.generatedAt,
    };
  }
}
