import { Injectable } from '@nestjs/common';
import { RawDataCollector } from '../collectors/raw-data.collector';
import { FemaleMetricsAnalyzer } from '../analyzers/female-metrics.analyzer';
import { GrowthAnalyzer } from '../analyzers/growth.analyzer';
import { FunnelAnalyzer } from '../analyzers/funnel.analyzer';
import { MatchHealthAnalyzer } from '../analyzers/match-health.analyzer';
import { RevenueAnalyzer } from '../analyzers/revenue.analyzer';
import { SafetyAnalyzer } from '../analyzers/safety.analyzer';
import { SegmentAnalyzer } from '../analyzers/segment.analyzer';
import { RetentionAnalyzer } from '../analyzers/retention.analyzer';
import { MarketplaceAnalyzer } from '../analyzers/marketplace.analyzer';
import { EngagementAnalyzer } from '../analyzers/engagement.analyzer';
import { MonetizationAnalyzer } from '../analyzers/monetization.analyzer';
import { FullIntelligenceReport } from 'src/interfaces';
import { AlertEngine } from '../alert.engine';
import { BusinessScoreCalculator } from '../business-score.calculator';
import { RecommendationEngine } from '../recommendation.engine';
import { ExecutiveSummaryGenerator } from '../executive-summary.generator';

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly collector: RawDataCollector,
    private readonly femaleAnalyzer: FemaleMetricsAnalyzer,
    private readonly growthAnalyzer: GrowthAnalyzer,
    private readonly funnelAnalyzer: FunnelAnalyzer,
    private readonly matchAnalyzer: MatchHealthAnalyzer,
    private readonly revenueAnalyzer: RevenueAnalyzer,
    private readonly safetyAnalyzer: SafetyAnalyzer,
    private readonly segmentAnalyzer: SegmentAnalyzer,
    private readonly retentionAnalyzer: RetentionAnalyzer,
    private readonly marketplaceAnalyzer: MarketplaceAnalyzer,
    private readonly engagementAnalyzer: EngagementAnalyzer,
    private readonly monetizationAnalyzer: MonetizationAnalyzer,
    private readonly alertEngine: AlertEngine,
    private readonly scoreCalc: BusinessScoreCalculator,
    private readonly recEngine: RecommendationEngine,
    private readonly summaryGen: ExecutiveSummaryGenerator,
  ) {}

  async getFullReport(): Promise<FullIntelligenceReport> {
    const raw = await this.collector.collect();

    const femaleMetrics = this.femaleAnalyzer.analyze(raw);
    const growth = this.growthAnalyzer.analyze(raw);
    const funnel = this.funnelAnalyzer.analyze(raw);
    const matchHealth = this.matchAnalyzer.analyze(raw);
    const revenue = this.revenueAnalyzer.analyze(raw);
    const safety = this.safetyAnalyzer.analyze(raw);
    const segments = this.segmentAnalyzer.analyze(raw);
    const retention = this.retentionAnalyzer.analyze(raw);
    const marketplace = this.marketplaceAnalyzer.analyze(raw);
    const engagement = this.engagementAnalyzer.analyze(raw);
    const monetization = this.monetizationAnalyzer.analyze(raw);

    const alerts = this.alertEngine.generate({
      femaleMetrics,
      growth,
      matchHealth,
      safety,
      funnel,
      revenue,
    });

    const businessScore = this.scoreCalc.calculate({
      femaleMetrics,
      matchHealth,
      growth,
      revenue,
      safety,
    });

    const recommendations = this.recEngine.generate({
      femaleMetrics,
      growth,
      matchHealth,
      safety,
      funnel,
      revenue,
    });

    const executiveSummary = this.summaryGen.generate({
      alerts,
      recommendations,
      femaleMetrics,
      growth,
      matchHealth,
    });

    return {
      executiveSummary,
      businessScore,
      femaleMetrics,
      growth,
      retention,
      funnel,
      matchHealth,
      marketplace,
      engagement,
      monetization,
      safety,
      segments,
      revenue,
      alerts,
      recommendations,
      northStar: {
        meaningfulConversations: raw.meaningfulConversations30d ?? 0,
        target: 500,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
