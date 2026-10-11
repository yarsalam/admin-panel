// مسیر: apps/server/src/ceo/ceo.module.ts
import { Module } from '@nestjs/common';
import { IntelligenceModule } from 'src/executive/intelligence/intelligence.module';
import { CeoDashboardController } from './controllers/ceo-dashboard.controller';
import { CeoDashboardService } from './services/ceo-dashboard.service';

/**
 * CeoModule
 * ──────────
 * فقط Controller + Service.
 * همه منطق از IntelligenceModule می‌آید.
 * هیچ TypeOrmModule، HttpModule، یا Analyzer اینجا نیست.
 */
@Module({
  imports: [IntelligenceModule],
  controllers: [CeoDashboardController],
  providers: [CeoDashboardService],
})
export class CeoModule {}
