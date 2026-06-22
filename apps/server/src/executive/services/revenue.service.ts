import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class RevenueService {
  private aiRevenueUrl: string;
  private aiSeoUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly userApiClient: UserApiClientService,
  ) {
    this.aiRevenueUrl =
      this.config.get('AI_REVENUE_URL') || 'http://ai_revenue:8006';
    this.aiSeoUrl = this.config.get('AI_SEO_URL') || 'http://ai_seo:8021';
  }

  async getRevenueOverview() {
    const [ltvData, revenueData] = await Promise.all([
      this.userApiClient
        .get('/admin-api/revenue/ltv-by-source')
        .catch(() => []),
      this.userApiClient.get('/admin-api/revenue/monthly').catch(() => null),
    ]);
    return { ltvBySource: ltvData, monthlyRevenue: revenueData };
  }

  async predictLTV(userId: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.aiRevenueUrl}/predict/ltv`, { userId }),
      );
      return data;
    } catch {
      return { predicted_ltv: 0 };
    }
  }

  async getForecast(days = 90) {
    try {
      const historical = await this.userApiClient
        .get('/admin-api/revenue/historical')
        .catch(() => []);
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.aiSeoUrl}/predict/traffic`, {
          historical_data: historical,
          days,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }

  async getAnomalies() {
    return this.userApiClient
      .get('/admin-api/revenue/anomalies')
      .catch(() => []);
  }
  async getStrategicDecisions() {
    return this.userApiClient
      .get('/admin-api/revenue/strategic-decisions')
      .catch(() => []);
  }
}
