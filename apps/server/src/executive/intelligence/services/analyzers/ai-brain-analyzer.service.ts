import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../../../admin/common/api-client/user-api-client.service';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class AiBrainAnalyzerService {
  private aiFeedbackUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
    private userApi: UserApiClientService,
  ) {
    this.aiFeedbackUrl =
      this.config.get('AI_FEEDBACK_URL') || 'http://ai_feedback:8004';
  }

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const metrics = await firstValueFrom(
        this.http.get(`${this.aiFeedbackUrl}/feedback/metrics`),
      )
        .then((r) => r.data)
        .catch(() => null);

      if (!metrics) return recommendations;

      // بررسی دقت مدل
      const accuracy = metrics.model_accuracy ?? 0;
      if (accuracy < 0.7) {
        recommendations.push({
          id: `ai-accuracy-${Date.now()}`,
          domain: 'ai',
          title: 'دقت مدل پیشنهاد پایین است',
          description: `دقت مدل AI فعلاً ${(accuracy * 100).toFixed(1)}٪ است (هدف: ۷۰٪+)`,
          expectedImpact: 0,
          priority: accuracy < 0.5 ? 'critical' : 'high',
          action: 'جمع‌آوری داده بیشتر و retrain مدل',
          confidence: 0.85,
        });
      }

      // بررسی نرخ تبدیل
      const conversionRate = metrics.conversion_rate ?? 0;
      if (conversionRate < 0.05) {
        recommendations.push({
          id: `ai-conversion-${Date.now()}`,
          domain: 'ai',
          title: 'نرخ تبدیل پیشنهادات پایین است',
          description: `فقط ${(conversionRate * 100).toFixed(1)}٪ پیشنهادات به خرید تبدیل می‌شوند`,
          expectedImpact: 500000,
          priority: 'medium',
          action: 'بهینه‌سازی تایمینگ و محتوای پیشنهادات',
          confidence: 0.7,
        });
      }
    } catch {
      // silent fail
    }

    return recommendations;
  }
}
