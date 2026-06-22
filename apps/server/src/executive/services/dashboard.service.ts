import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class DashboardService {
  private aiOpsUrl: string;
  private aiFeedbackUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly userApiClient: UserApiClientService,
  ) {
    this.aiOpsUrl = this.config.get('AI_OPS_URL') || 'http://ai_ops:8025';
    this.aiFeedbackUrl =
      this.config.get('AI_FEEDBACK_URL') || 'http://ai_feedback:8004';
  }

  async getKPIs() {
    try {
      const [usersData, revenueData, growthData] = await Promise.all([
        this.userApiClient
          .get('/admin-api/users/count')
          .catch(() => ({ total: 0 })),
        this.userApiClient
          .get('/admin-api/payments/total-revenue')
          .catch(() => ({ total: 0 })),
        this.userApiClient
          .get('/admin-api/users/growth-rate')
          .catch(() => ({ rate: 0 })),
      ]);

      let feedbackScore = 0;
      try {
        const { data } = await firstValueFrom(
          this.httpService.get(`${this.aiFeedbackUrl}/feedback/metrics`),
        );
        feedbackScore = data.global_score ?? 0;
      } catch {}

      return {
        totalUsers: usersData?.total ?? 0,
        totalRevenue: revenueData?.total ?? 0,
        growthRate: growthData?.rate ?? 0,
        feedbackScore,
      };
    } catch {
      return {
        totalUsers: 0,
        totalRevenue: 0,
        growthRate: 0,
        feedbackScore: 0,
      };
    }
  }

  async getPhaseDistribution() {
    return this.userApiClient
      .get('/admin-api/phase/distribution')
      .catch(() => ({}));
  }

  async getAlerts() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.aiOpsUrl}/issues`),
      );
      return data;
    } catch {
      return [];
    }
  }

  async getCompetitorRadar() {
    return this.userApiClient
      .get('/admin-api/seo/competitor-changes')
      .catch(() => []);
  }
}
