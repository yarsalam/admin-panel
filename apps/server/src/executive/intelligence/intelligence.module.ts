import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../../admin/common/api-client/user-api-client.module';
import { DecisionRecord } from './entities/decision-record.entity';
import { CommandCenterController } from './controllers/command-center.controller';
import { RecommendationController } from './controllers/recommendation.controller';
import { DecisionTrackerController } from './controllers/decision-tracker.controller';
import { OperationalScoreService } from './services/operational-score.service';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { DecisionTrackerService } from './services/decision-tracker.service';
import { RevenueLeakAnalyzerService } from './services/analyzers/revenue-leak-analyzer.service';
import { UserHealthAnalyzerService } from './services/analyzers/user-health-analyzer.service';
import { SeoIntelligenceAnalyzerService } from './services/analyzers/seo-intelligence-analyzer.service';
import { AiBrainAnalyzerService } from './services/analyzers/ai-brain-analyzer.service';
import { CompetitorIntelligenceAnalyzerService } from './services/analyzers/competitor-intelligence-analyzer.service';
import { PerformanceAnalyzerService } from './services/analyzers/performance-analyzer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionRecord]),
    HttpModule,
    UserApiClientModule,
  ],
  controllers: [
    CommandCenterController,
    RecommendationController,
    DecisionTrackerController,
  ],
  providers: [
    OperationalScoreService,
    RecommendationEngineService,
    DecisionTrackerService,
    RevenueLeakAnalyzerService,
    UserHealthAnalyzerService,
    SeoIntelligenceAnalyzerService,
    AiBrainAnalyzerService,
    CompetitorIntelligenceAnalyzerService,
    PerformanceAnalyzerService,
  ],
  exports: [RecommendationEngineService, DecisionTrackerService],
})
export class IntelligenceModule {}
