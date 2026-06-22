// apps/server/src/growth/growth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { CampaignsController } from './controllers/campaigns.controller';
import { SeoStudioController } from './controllers/seo-studio.controller';
import { SocialController } from './controllers/social.controller';
import { MonetizationController } from './controllers/monetization.controller';
import { CampaignsService } from './services/campaigns.service';
import { SeoStudioService } from './services/seo-studio.service';
import { SocialService } from './services/social.service';
import { MonetizationService } from './services/monetization.service';
import { ReferralsModule } from './referrals/referrals.module';

@Module({
  imports: [HttpModule, UserApiClientModule, ReferralsModule],
  controllers: [
    CampaignsController,
    SeoStudioController,
    SocialController,
    MonetizationController,
  ],
  providers: [
    CampaignsService,
    SeoStudioService,
    SocialService,
    MonetizationService,
  ],
})
export class GrowthModule {}
