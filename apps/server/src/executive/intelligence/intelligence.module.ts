import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from 'src/admin/common/api-client/user-api-client.module';

// Entity (فقط entity محلی ادمین پنل — نه یوزر)
import { DecisionRecord } from './entities/decision-record.entity';

// Collector
import { RawDataCollector } from './collectors/raw-data.collector';

// Analyzers
import { FemaleMetricsAnalyzer } from './analyzers/female-metrics.analyzer';
import { GrowthAnalyzer } from './analyzers/growth.analyzer';
import { FunnelAnalyzer } from './analyzers/funnel.analyzer';
import { MatchHealthAnalyzer } from './analyzers/match-health.analyzer';
import { RevenueAnalyzer } from './analyzers/revenue.analyzer';
import { SafetyAnalyzer } from './analyzers/safety.analyzer';
import { SegmentAnalyzer } from './analyzers/segment.analyzer';
import { RetentionAnalyzer } from './analyzers/retention.analyzer';
import { MarketplaceAnalyzer } from './analyzers/marketplace.analyzer';
import { EngagementAnalyzer } from './analyzers/engagement.analyzer';
import { MonetizationAnalyzer } from './analyzers/monetization.analyzer';

// Engines

// مغز مرکزی
import { IntelligenceService } from './services/intelligence.service';
import { AlertEngine } from './alert.engine';
import { BusinessScoreCalculator } from './business-score.calculator';
import { RecommendationEngine } from './recommendation.engine';
import { ExecutiveSummaryGenerator } from './executive-summary.generator';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionRecord]),
    HttpModule,
    UserApiClientModule,
  ],
  controllers: [],
  providers: [
    RawDataCollector,
    FemaleMetricsAnalyzer,
    GrowthAnalyzer,
    FunnelAnalyzer,
    MatchHealthAnalyzer,
    RevenueAnalyzer,
    SafetyAnalyzer,
    SegmentAnalyzer,
    RetentionAnalyzer,
    MarketplaceAnalyzer,
    EngagementAnalyzer,
    MonetizationAnalyzer,
    AlertEngine,
    BusinessScoreCalculator,
    RecommendationEngine,
    ExecutiveSummaryGenerator,
    IntelligenceService,
  ],
  exports: [
    IntelligenceService,
    RawDataCollector,
    BusinessScoreCalculator,
    FemaleMetricsAnalyzer,
    MatchHealthAnalyzer,
    GrowthAnalyzer,
    RevenueAnalyzer,
    SafetyAnalyzer,
  ],
})
export class IntelligenceModule {}
