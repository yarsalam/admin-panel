import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { ReferralsService } from './referrals.service';
import { ReferralCampaign } from './entities/referral-campaign.entity';
import { RequirePermissions } from '../../admin/common/decorators/roles.decorator';

@Controller('growth/referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly service: ReferralsService) {}

  // کمپین‌ها
  @Get('campaigns')
  getCampaigns() {
    return this.service.findAll();
  }

  @Post('campaigns')
  @RequirePermissions('manage_referral_campaigns')
  createCampaign(@Body() dto: Partial<ReferralCampaign>) {
    return this.service.create(dto);
  }

  @Put('campaigns/:id')
  @RequirePermissions('manage_referral_campaigns')
  updateCampaign(
    @Param('id') id: number,
    @Body() dto: Partial<ReferralCampaign>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('campaigns/:id')
  @RequirePermissions('manage_referral_campaigns')
  deleteCampaign(@Param('id') id: number) {
    return this.service.remove(id);
  }

  // آمار
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('top-referrers')
  getTopReferrers(@Query('limit') limit: number) {
    return this.service.getTopReferrers(limit || 10);
  }

  @Get('user/:userId')
  getUserReferralInfo(@Param('userId') userId: number) {
    return this.service.getUserReferralInfo(userId);
  }
}
