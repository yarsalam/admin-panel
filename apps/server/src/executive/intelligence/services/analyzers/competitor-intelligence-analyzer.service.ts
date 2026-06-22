import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../../../admin/common/api-client/user-api-client.service';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class CompetitorIntelligenceAnalyzerService {
  constructor(private userApi: UserApiClientService) {}

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const analysis = await this.userApi
        .get('/admin-api/seo/competitor-analysis')
        .catch(() => null);

      if (!analysis) return recommendations;

      const competitors = analysis as any[];
      const strongerCompetitors = competitors.filter(
        (c) => c.trafficGrowth > 0.2 && c.isMainCompetitor,
      );

      if (strongerCompetitors.length > 0) {
        recommendations.push({
          id: `competitor-${Date.now()}`,
          domain: 'seo',
          title: `${strongerCompetitors.length} رقیب رشد سریع دارد`,
          description: `رقبایی مثل "${strongerCompetitors[0]?.name}" ماهانه ${(strongerCompetitors[0]?.trafficGrowth * 100).toFixed(0)}٪ رشد ترافیک دارند`,
          expectedImpact: 0,
          priority: strongerCompetitors.length > 2 ? 'high' : 'medium',
          action: 'تحلیل استراتژی محتوایی رقبا و پاسخ سریع',
          confidence: 0.7,
        });
      }
    } catch {
      // silent fail
    }

    return recommendations;
  }
}
