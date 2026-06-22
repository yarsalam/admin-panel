import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../../../admin/common/api-client/user-api-client.service';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class UserHealthAnalyzerService {
  constructor(private userApi: UserApiClientService) {}

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const funnel = await this.userApi
        .get('/admin-api/users/funnel')
        .catch(() => []);

      // بررسی نقاط ریزش در قیف ثبت‌نام
      const criticalSteps = [
        {
          step: 'photo_upload',
          threshold: 0.3,
          label: 'آپلود عکس',
          action: 'ساده‌سازی فرآیند آپلود عکس',
          impact: 150000 * 50,
        },
        {
          step: 'profile_complete',
          threshold: 0.5,
          label: 'تکمیل پروفایل',
          action: 'اضافه کردن راهنمای تعاملی',
          impact: 100000 * 30,
        },
        {
          step: 'first_like',
          threshold: 0.4,
          label: 'اولین لایک',
          action: 'نمایش پروفایل‌های جذاب در اول',
          impact: 80000 * 40,
        },
      ];

      for (const check of criticalSteps) {
        const stepData = (funnel as any[]).find((f) => f.step === check.step);
        if (stepData && stepData.conversion < check.threshold) {
          recommendations.push({
            id: `user-health-${check.step}-${Date.now()}`,
            domain: 'users',
            title: `ریزش در مرحله ${check.label}`,
            description: `تنها ${(stepData.conversion * 100).toFixed(1)}% کاربران مرحله ${check.label} را تکمیل می‌کنند (هدف: ${check.threshold * 100}%)`,
            expectedImpact: check.impact,
            priority:
              stepData.conversion < check.threshold * 0.5 ? 'critical' : 'high',
            action: check.action,
            confidence: 0.8,
          });
        }
      }
    } catch {
      // silent fail
    }

    return recommendations;
  }
}
