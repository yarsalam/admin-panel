import { Module } from '@nestjs/common';

import { IntelligenceModule } from './intelligence/intelligence.module';
import { BusinessScoreModule } from './business-score/business-score.module';

import { DashboardController } from './dashboard/dashboard.controller';
import { RevenueController } from './controllers/revenue.controller';
import { UserApiClientModule } from 'src/admin/common/api-client/user-api-client.module';
import { GrowthModule } from 'src/growth/growth.module';
import { ExecutiveSeoSummaryService } from './services/executive-seo-summary.service';
import { RolesGuard } from '../admin/common/guards/roles.guard';

@Module({
  imports: [IntelligenceModule, BusinessScoreModule, GrowthModule, UserApiClientModule],
  controllers: [DashboardController, RevenueController],
  providers: [ExecutiveSeoSummaryService, RolesGuard],
  exports: [IntelligenceModule, BusinessScoreModule],
})
export class ExecutiveModule {}
