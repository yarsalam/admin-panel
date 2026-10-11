import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  private aiSupportUrl: string;

  constructor(
    private userApi: UserApiClientService,
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.aiSupportUrl =
      config.get('AI_SUPPORT_URL') || 'http://ai_support:8016';
  }

  /** آمار اصلی تیکت‌ها */
  async getTicketKPIs() {
    return this.userApi.get('/tickets/dashboard-stats').catch(() => ({
      open: 0,
      inProgress: 0,
      resolved: 0,
      slaBreached: 0,
      avgResolutionHours: '0',
    }));
  }

  /** SEO Insights از سرویس AI */
  async getAiInsights() {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.aiSupportUrl}/api/seo-insights`),
      );
      return data;
    } catch {
      return null;
    }
  }

  /** آمار گزارش‌ها */
  async getReportStats() {
    return this.userApi.get('/reports/stats').catch(() => null);
  }

  /** آمار مودریشن */
  async getModerationStats() {
    return this.userApi
      .get('/admin-api/safety/moderation/stats')
      .catch(() => null);
  }

  /** داشبورد ترکیبی */
  async getFullDashboard() {
    const [tickets, reports, moderation, aiInsights] = await Promise.all([
      this.getTicketKPIs(),
      this.getReportStats(),
      this.getModerationStats(),
      this.getAiInsights(),
    ]);

    return { tickets, reports, moderation, aiInsights };
  }
}
