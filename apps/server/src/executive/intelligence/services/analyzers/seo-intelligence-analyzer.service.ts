import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../../../admin/common/api-client/user-api-client.service';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class SeoIntelligenceAnalyzerService {
  constructor(private userApi: UserApiClientService) {}

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const [opportunities, competitorChanges] = await Promise.all([
        this.userApi
          .get('/admin-api/seo/content-opportunities')
          .catch(() => []),
        this.userApi.get('/admin-api/seo/competitor-changes').catch(() => []),
      ]);

      const opList = opportunities as any[];
      const compChanges = competitorChanges as any[];

      if (opList.length > 0) {
        const highPotential = opList.filter((o) => o.potentialTraffic > 1000);
        if (highPotential.length > 0) {
          recommendations.push({
            id: `seo-opportunities-${Date.now()}`,
            domain: 'seo',
            title: `${highPotential.length} فرصت محتوایی با ترافیک بالا`,
            description: `موضوعاتی مثل "${highPotential[0]?.topic}" می‌توانند ماهانه ${highPotential[0]?.potentialTraffic?.toLocaleString()} بازدید اضافه کنند`,
            expectedImpact: highPotential.reduce(
              (s, o) => s + (o.estimatedRevenue || 0),
              0,
            ),
            priority: 'medium',
            action: `تولید محتوا برای ${Math.min(3, highPotential.length)} موضوع اول`,
            confidence: 0.65,
          });
        }
      }

      if (compChanges.length > 0) {
        const recentChanges = compChanges.filter((c) => c.isRecent);
        if (recentChanges.length > 0) {
          recommendations.push({
            id: `seo-competitor-${Date.now()}`,
            domain: 'seo',
            title: 'تغییرات جدید رقبا شناسایی شد',
            description: `${recentChanges.length} تغییر مهم از رقبا در هفته اخیر`,
            expectedImpact: 0,
            priority: 'medium',
            action: 'بررسی و پاسخ به تغییرات رقبا',
            confidence: 0.9,
          });
        }
      }
    } catch {
      // silent fail
    }

    return recommendations;
  }
}
