import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../admin/common/guards/roles.guard';
import { Roles } from '../../admin/common/decorators/roles.decorator';
import { IntelligenceService } from '../intelligence/services/intelligence.service';
import { SeoStudioService } from 'src/growth/services/seo-studio.service';
import { ExecutiveSeoSummaryService } from '../services/executive-seo-summary.service';

@Controller('exec/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'marketing')
export class DashboardController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly seoSummaryService: ExecutiveSeoSummaryService,
  ) {}

  @Get()
  async fullDashboard() {
    const [report] = await Promise.allSettled([
      this.intelligenceService.getFullReport(),
    ]);

    const r = report.status === 'fulfilled' ? report.value : null;
    if (!r) return { error: 'داده‌ها در دسترس نیستند' };

    // ✅ هر دو از marketplace که هر دو activeGenderCounts (30d) هستند
    const activeFemale30d = r.marketplace?.activeFemale30d ?? 0;
    const activeMale30d = r.marketplace?.activeMale30d ?? 0;

    return {
      kpis: {
        totalUsers: r.growth.mau.current,
        totalRevenue: r.revenue.totalThisMonth,
        growthRate: r.growth.mau.deltaPercent,
        feedbackScore: r.businessScore.total,
        newUsersToday: r.growth.newUsersToday,
        dauMauRatio: r.growth.dauMauRatio,
      },

      // ✅ growth فیلد اضافه شد — قبلاً اصلاً در response نبود
      growth: {
        dau: r.growth.dau,
        mau: r.growth.mau,
        dauMauRatio: r.growth.dauMauRatio,
        newUsersToday: r.growth.newUsersToday,
        newUsersThisWeek: r.growth.newUsersThisWeek,
        retentionD7: r.growth.retentionD7,
        retentionD30: r.growth.retentionD30,
      },

      femaleMetrics: {
        femaleActiveUsers: r.femaleMetrics.femaleActiveUsers,
        femaleRatio: r.femaleMetrics.femaleRatio,
        activeFemaleRatio: r.femaleMetrics.activeFemaleRatio,
        verifiedFemaleRatio: r.femaleMetrics.verifiedFemaleRatio,
        femaleRetentionD7: r.femaleMetrics.femaleRetentionD7,
        femaleRetentionD30: r.femaleMetrics.femaleRetentionD30,
        femaleMatchSuccessRate: r.femaleMetrics.femaleMatchSuccessRate,
        femaleGrowth7d: (r.femaleMetrics as any).femaleGrowth7d ?? 0,
        newFemaleThisWeek: r.femaleMetrics.newFemaleThisWeek,
        healthScore: r.femaleMetrics.healthScore,
      },

      marketplace: {
        ...(r.marketplace || {}),
        activeFemale30d,
        activeMale30d,
      },

      genderBalance: {
        // ✅ نام صادقانه: 30d نه 7d
        femaleActive30d: activeFemale30d,
        maleActive30d: activeMale30d,
        ratio: r.femaleMetrics.activeFemaleRatio,
        healthScore: r.femaleMetrics.healthScore,
        verifiedRatio: r.femaleMetrics.verifiedFemaleRatio,
      },

      matchHealth: {
        matchRate: r.matchHealth.matchRate.current,
        matchRateDelta: r.matchHealth.matchRate.deltaPercent,
        conversationRate: r.matchHealth.conversationRate.current,
        conversationRateDelta: r.matchHealth.conversationRate.deltaPercent,
        replyRate: r.matchHealth.replyRate.current,
        readRate: (r.matchHealth as any).readRate?.current ?? 0,
        ghostingRate: r.matchHealth.ghostingRate ?? 0,
        firstMessageSuccess: r.matchHealth.firstMessageSuccessRate,
        avgMessages: r.matchHealth.avgMessagesPerMatch,
        qualityScore: r.matchHealth.qualityScore,
      },

      retention: {
        d7: r.growth.retentionD7.current,
        d30: r.growth.retentionD30.current,
        femaleD7: r.femaleMetrics.femaleRetentionD7,
        femaleD30: r.femaleMetrics.femaleRetentionD30,
        maleD30: r.retention?.femaleVsMale?.maleD30 ?? 0,
        premiumD30: r.retention?.premiumVsFree?.premiumD30 ?? 0,
        freeD30: r.retention?.premiumVsFree?.freeD30 ?? 0,
      },

      revenue: {
        mrr: r.revenue.mrr.current,
        mrrDelta: r.revenue.mrr.deltaPercent,
        arpu: r.revenue.arpu,
        conversionRate: r.revenue.conversionRate,
        // ✅ churnRate صفر = داده نداریم → null بفرست تا UI صادقانه رندر کنه
        churnRate: r.revenue.churnRate > 0 ? r.revenue.churnRate : null,
        ltv: r.revenue.ltv,
        totalThisMonth: r.revenue.totalThisMonth,
      },

      funnel: r.funnel.steps.map((s) => ({
        step: s.step,
        label: s.label,
        count: s.count,
        conversion: s.conversionFromPrevious,
        dropRate: s.dropRate,
        isBottleneck: s.isBottleneck,
      })),

      phaseDistribution: r.segments.byPhase.map((p) => ({
        name: p.label,
        value: p.count,
        percentage: p.percentage,
      })),

      safety: {
        reportsToday: r.safety.reportsToday,
        pendingModeration: r.safety.pendingModeration,
        autoBlocked: r.safety.autoBlocked,
        fakeProfiles: r.safety.fakeProfiles,
        highRiskUsers: r.safety.highRiskUsers,
        verifiedProfiles: r.safety.verifiedProfiles,
      },

      alerts: (r.alerts || []).map((a) => ({
        id: a.id,
        type: a.severity === 'critical' ? 'critical' : 'warning',
        severity: a.severity,
        domain: a.domain,
        message: a.title,
        detail: a.detail,
        timestamp: a.triggeredAt,
      })),

      businessScore: {
        ...r.businessScore,
        // ✅ trend هاردکد stable بود — null بفرست تا UI بدونه داده ندارد
        trend:
          r.businessScore.trend === 'stable' ? null : r.businessScore.trend,
        previous:
          r.businessScore.previous === r.businessScore.total
            ? null
            : r.businessScore.previous,
      },

      // ✅ نام یکسان با فرانت: recommendations نه topRecommendations
      recommendations: (r.recommendations || []).slice(0, 10).map((rec) => ({
        id: rec.id,
        domain: rec.domain,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        impactLabel: rec.impactLabel,
        confidence: rec.confidence,
        action: rec.action,
      })),

      services: [
        { name: 'ai_verification', status: 'up' as const },
        { name: 'ai_moderation', status: 'up' as const },
        { name: 'ai_image', status: 'up' as const },
        { name: 'embedded_ai', status: 'down' as const },
        { name: 'ai_seo', status: 'up' as const },
        { name: 'ai_revenue', status: 'up' as const },
        { name: 'ai_ops', status: 'up' as const },
      ],

      // ✅ competitor-radar: صادقانه null به‌جای آرایه خالی بی‌معنی
      competitorRadar: null,
      northStar: r.northStar,
      generatedAt: r.generatedAt,
    };
  }

  @Get('kpis')
  async kpis() {
    const r = await this.intelligenceService.getFullReport();
    return {
      totalUsers: r.growth.mau.current,
      totalRevenue: r.revenue.totalThisMonth,
      growthRate: r.growth.mau.deltaPercent,
      feedbackScore: r.businessScore.total,
    };
  }

  @Get('phase-distribution')
  async phaseDistribution() {
    const r = await this.intelligenceService.getFullReport();
    return r.segments.byPhase.map((p) => ({ name: p.label, value: p.count }));
  }

  @Get('alerts')
  async alerts() {
    const r = await this.intelligenceService.getFullReport();
    return r.alerts.map((a) => ({
      type: a.severity === 'critical' ? 'critical' : 'warning',
      message: a.title,
      timestamp: a.triggeredAt,
    }));
  }

  // ✅ صادقانه: placeholder واضح
  @Get('competitor-radar')
  async competitorRadar() {
    return { available: false, reason: 'در دست توسعه' };
  }

  @Get('seo-widget')
  async getSEOWidget() {
    return this.seoSummaryService.getSummary();
  }
}
