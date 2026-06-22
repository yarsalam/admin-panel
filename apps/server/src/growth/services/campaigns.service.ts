// apps/server/src/growth/services/campaigns.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class CampaignsService {
  constructor(private readonly api: UserApiClientService) {}

  async list() {
    try {
      return await this.api.get('/admin-api/growth/campaigns');
    } catch {
      return [];
    }
  }
  async create(dto: any) {
    return this.api.post('/admin-api/growth/campaigns', dto);
  }
  async analyze() {
    try {
      return await this.api.get('/admin-api/growth/campaigns/analyze');
    } catch {
      return null;
    }
  }
  async ltvBySource() {
    try {
      return await this.api.get('/admin-api/growth/campaigns/ltv-by-source');
    } catch {
      return null;
    }
  }
  async forecast(data: any[], days = 90) {
    try {
      return await this.api.post('/admin-api/growth/campaigns/forecast', {
        historicalData: data,
        days,
      });
    } catch {
      return null;
    }
  }
  async sendFeedback(data: any) {
    try {
      return await this.api.post('/admin-api/growth/campaigns/feedback', data);
    } catch {
      return null;
    }
  }
}
