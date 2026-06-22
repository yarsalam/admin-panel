import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralCampaign } from './entities/referral-campaign.entity';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralCampaign)
    private campaignRepo: Repository<ReferralCampaign>,
    private userApiClient: UserApiClientService,
  ) {}

  // ----- مدیریت کمپین‌ها -----
  findAll(): Promise<ReferralCampaign[]> {
    return this.campaignRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: Partial<ReferralCampaign>): Promise<ReferralCampaign> {
    const campaign = this.campaignRepo.create(dto);
    return this.campaignRepo.save(campaign);
  }

  async update(
    id: number,
    dto: Partial<ReferralCampaign>,
  ): Promise<ReferralCampaign> {
    const campaign = await this.campaignRepo.findOneBy({ id });
    if (!campaign) throw new NotFoundException('Campaign not found');
    Object.assign(campaign, dto);
    return this.campaignRepo.save(campaign);
  }

  async remove(id: number): Promise<void> {
    await this.campaignRepo.delete(id);
  }

  // ----- آمار (از Main App) -----
  getStats() {
    return this.userApiClient.get('/referrals/stats');
  }

  getTopReferrers(limit = 10) {
    return this.userApiClient.get('/referrals/top-referrers', { limit });
  }

  getUserReferralInfo(userId: number) {
    return this.userApiClient.get(`/referrals/user/${userId}`);
  }
}
