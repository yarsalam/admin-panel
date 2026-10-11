import { Module } from '@nestjs/common';

import { IntelligenceModule } from './intelligence/intelligence.module';
import { BusinessScoreModule } from './business-score/business-score.module';

import { DashboardController } from './dashboard/dashboard.controller';
import { GrowthModule } from 'src/growth/growth.module';
import { ExecutiveSeoSummaryService } from './services/executive-seo-summary.service';

@Module({
  imports: [IntelligenceModule, BusinessScoreModule, GrowthModule],
  controllers: [DashboardController],
  providers: [ExecutiveSeoSummaryService],
  exports: [IntelligenceModule, BusinessScoreModule],
})
export class ExecutiveModule {}
