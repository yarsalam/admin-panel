import { Injectable } from '@nestjs/common';
import { Recommendation } from '../interfaces/recommendation.interface';
import { RevenueLeakAnalyzerService } from './analyzers/revenue-leak-analyzer.service';
import { UserHealthAnalyzerService } from './analyzers/user-health-analyzer.service';
import { SeoIntelligenceAnalyzerService } from './analyzers/seo-intelligence-analyzer.service';
import { AiBrainAnalyzerService } from './analyzers/ai-brain-analyzer.service';
import { CompetitorIntelligenceAnalyzerService } from './analyzers/competitor-intelligence-analyzer.service';
import { PerformanceAnalyzerService } from './analyzers/performance-analyzer.service';

@Injectable()
export class RecommendationEngineService {
  constructor(
    private revenueLeak: RevenueLeakAnalyzerService,
    private userHealth: UserHealthAnalyzerService,
    private seoIntelligence: SeoIntelligenceAnalyzerService,
    private aiBrain: AiBrainAnalyzerService,
    private competitor: CompetitorIntelligenceAnalyzerService,
    private performance: PerformanceAnalyzerService,
  ) {}

  async getTopRecommendations(): Promise<Recommendation[]> {
    const results = await Promise.allSettled([
      this.revenueLeak.analyze(),
      this.userHealth.analyze(),
      this.seoIntelligence.analyze(),
      this.aiBrain.analyze(),
      this.competitor.analyze(),
      this.performance.analyze(),
    ]);

    const all = results.flatMap((r) =>
      r.status === 'fulfilled' ? r.value : [],
    );

    all.sort((a, b) => {
      const priorityDiff =
        this.priorityWeight(b.priority) - this.priorityWeight(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      // در صورت تساوی priority، بر اساس expectedImpact مرتب‌سازی
      return (b.expectedImpact || 0) - (a.expectedImpact || 0);
    });

    return all.slice(0, 10).map((r) => ({
      ...r,
      createdAt: r.createdAt ?? new Date(),
    }));
  }

  private priorityWeight(p: string): number {
    switch (p) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }
}
