import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../../../admin/common/api-client/user-api-client.service';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class RevenueLeakAnalyzerService {
  constructor(private userApi: UserApiClientService) {}

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // قیف واقعی به جای فقط viewed vs purchased
      const [funnelData, payments] = await Promise.all([
        this.userApi.get('/admin-api/payments/funnel').catch(() => null),
        this.userApi.get('/admin-api/payments/recent').catch(() => []),
      ]);

      if (funnelData) {
        // تحلیل قیف چند مرحله‌ای
        const steps = this.analyzeFunnel(funnelData);

        for (const step of steps) {
          if (step.dropoffRate > 0.5) {
            recommendations.push({
              id: `revenue-leak-funnel-${step.name}-${Date.now()}`,
              domain: 'revenue',
              title: `ریزش بالا در مرحله ${step.label}`,
              description: `${(step.dropoffRate * 100).toFixed(1)}٪ کاربران در مرحله ${step.label} ریزش دارند`,
              expectedImpact: step.missedRevenue,
              priority: step.dropoffRate > 0.7 ? 'critical' : 'high',
              action: step.suggestedAction,
              confidence: 0.75,
            });
          }
        }
      } else {
        // Fallback: تحلیل ساده
        const recentUsers = await this.userApi
          .get('/admin-api/users/recent-active')
          .catch(() => []);
        const promotionViewers = (recentUsers as any[]).filter(
          (u) => u.viewedPromotion,
        ).length;
        const actualPurchases = (payments as any[]).length;
        const missed = promotionViewers - actualPurchases;

        if (missed > 50) {
          const avgLtv = 150000;
          recommendations.push({
            id: `revenue-leak-simple-${Date.now()}`,
            domain: 'revenue',
            title: 'نشتی درآمد: کاربران به خرید نمی‌رسند',
            description: `${missed} کاربر صفحهٔ خرید را دیدند اما خرید نکردند`,
            expectedImpact: missed * avgLtv * 0.1,
            priority: missed > 100 ? 'critical' : 'high',
            action: 'ارسال پیشنهاد تخفیف ۲۰٪ به کاربران در آستانهٔ خرید',
            confidence: 0.6,
          });
        }
      }
    } catch (err) {
      // analyzer هیچ‌وقت نباید throw کند
    }

    return recommendations;
  }

  private analyzeFunnel(funnelData: any): Array<{
    name: string;
    label: string;
    dropoffRate: number;
    missedRevenue: number;
    suggestedAction: string;
  }> {
    const avgLtv = 150000;
    const steps = [
      {
        name: 'promotion_view',
        label: 'مشاهده تبلیغ',
        from: funnelData.promotion_viewed ?? 0,
        to: funnelData.promotion_clicked ?? 0,
        action: 'بهبود طراحی و محتوای تبلیغات',
      },
      {
        name: 'checkout_start',
        label: 'شروع پرداخت',
        from: funnelData.promotion_clicked ?? 0,
        to: funnelData.checkout_started ?? 0,
        action: 'ساده‌سازی صفحه محصول و اضافه کردن Social Proof',
      },
      {
        name: 'payment_complete',
        label: 'تکمیل پرداخت',
        from: funnelData.checkout_started ?? 0,
        to: funnelData.payment_success ?? 0,
        action: 'بررسی مشکلات درگاه پرداخت و اضافه کردن روش‌های پرداخت',
      },
    ];

    return steps.map((step) => ({
      name: step.name,
      label: step.label,
      dropoffRate: step.from > 0 ? 1 - step.to / step.from : 0,
      missedRevenue: (step.from - step.to) * avgLtv * 0.1,
      suggestedAction: step.action,
    }));
  }
}
