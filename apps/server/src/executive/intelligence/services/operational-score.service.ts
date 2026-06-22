import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../../admin/common/api-client/user-api-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// وزن‌های هر بخش بر اساس اولویت کسب‌وکار
const SCORE_WEIGHTS = {
  revenue: 0.4,
  retention: 0.3,
  feedback: 0.2,
  infrastructure: 0.1,
} as const;

@Injectable()
export class OperationalScoreService {
  private aiFeedbackUrl: string;
  private aiOpsUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
    private userApi: UserApiClientService,
  ) {
    this.aiFeedbackUrl =
      this.config.get('AI_FEEDBACK_URL') || 'http://ai_feedback:8004';
    this.aiOpsUrl = this.config.get('AI_OPS_URL') || 'http://ai_ops:8025';
  }

  async getBusinessScore() {
    const [feedback, revenue, users, ops] = await Promise.allSettled([
      firstValueFrom(
        this.http.get(`${this.aiFeedbackUrl}/feedback/metrics`),
      ).then((r) => r.data),
      this.userApi.get('/admin-api/revenue/ltv-by-source').catch(() => []),
      this.userApi.get('/admin-api/phase/distribution').catch(() => ({})),
      firstValueFrom(this.http.get(`${this.aiOpsUrl}/metrics/latest`)).catch(
        () => ({}),
      ),
    ]);

    const breakdown = {
      revenue: this.calcRevenueScore(
        revenue.status === 'fulfilled' ? revenue.value : [],
      ),
      retention: this.calcRetentionScore(
        users.status === 'fulfilled' ? users.value : {},
      ),
      feedback:
        feedback.status === 'fulfilled'
          ? Math.min(100, ((feedback.value as any).global_score ?? 0) * 20)
          : 0,
      infrastructure:
        ops.status === 'fulfilled' ? this.calcInfraScore(ops.value) : 0,
    };

    // رفع: وزن‌دهی متفاوت به جای میانگین ساده
    const total = Math.round(
      breakdown.revenue * SCORE_WEIGHTS.revenue +
        breakdown.retention * SCORE_WEIGHTS.retention +
        breakdown.feedback * SCORE_WEIGHTS.feedback +
        breakdown.infrastructure * SCORE_WEIGHTS.infrastructure,
    );

    // اضافه کردن Trend
    const trend = await this.getTrend(total);

    return { total, breakdown, trend, weights: SCORE_WEIGHTS };
  }

  private async getTrend(currentScore: number): Promise<{
    previous: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }> {
    // TODO: ذخیره score تاریخی در Redis یا DB برای مقایسه واقعی
    // فعلاً placeholder که در آینده با داده واقعی جایگزین می‌شود
    return { previous: currentScore, change: 0, direction: 'stable' };
  }

  private calcRevenueScore(ltvData: any[]): number {
    if (!ltvData.length) return 0;
    const avgLtv =
      ltvData.reduce((s, i) => s + (i.ltv || 0), 0) / ltvData.length;
    return Math.min(100, avgLtv * 5);
  }

  private calcRetentionScore(phases: any): number {
    const values = Object.values(phases) as number[];
    const total = values.reduce((s, v) => s + v, 0) || 1;
    const hot = (phases.hot as number) || 0;
    return Math.round((hot / total) * 100);
  }

  private calcInfraScore(metrics: any): number {
    const cpu = metrics?.system?.cpu?.average || 0;
    const ram = metrics?.system?.memory?.percent || 0;
    const latency = metrics?.app?.avg_response_time || 0;
    const errorRate = metrics?.app?.error_rate || 0;
    let score = 100;
    if (cpu > 70) score -= 20;
    if (cpu > 85) score -= 15; // کاهش بیشتر در مقادیر بالاتر
    if (ram > 80) score -= 20;
    if (latency > 300) score -= 20;
    if (errorRate > 0.01) score -= 15; // بیش از ۱٪ خطا
    return Math.max(0, score);
  }
}
