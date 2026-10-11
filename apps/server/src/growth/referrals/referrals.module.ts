import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCampaign } from './entities/referral-campaign.entity';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { UserApiClientModule } from '../../admin/common/api-client/user-api-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralCampaign]), UserApiClientModule],
  controllers: [ReferralsController],
  providers: [ReferralsService],
})
export class ReferralsModule {}
