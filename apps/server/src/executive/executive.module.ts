import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { DashboardController } from './controllers/dashboard.controller';
import { RevenueController } from './controllers/revenue.controller';
import { SeoController } from './controllers/seo.controller';
import { SystemHealthController } from './controllers/system-health.controller';
import { DashboardService } from './services/dashboard.service';
import { RevenueService } from './services/revenue.service';
import { SeoService } from './services/seo.service';
import { SystemHealthService } from './services/system-health.service';
import { IntelligenceModule } from './intelligence/intelligence.module';

@Module({
  imports: [HttpModule, UserApiClientModule, IntelligenceModule],
  controllers: [
    DashboardController,
    RevenueController,
    SeoController,
    SystemHealthController,
  ],
  providers: [
    DashboardService,
    RevenueService,
    SeoService,
    SystemHealthService,
  ],
})
export class ExecutiveModule {}
