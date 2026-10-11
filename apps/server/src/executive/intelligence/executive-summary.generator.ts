import { Injectable } from '@nestjs/common';
import {
  ExecutiveSummary,
  Alert,
  Recommendation,
  FemaleMetrics,
  GrowthMetrics,
  MatchHealth,
} from 'src/interfaces';

interface SummaryInput {
  alerts: Alert[];
  recommendations: Recommendation[];
  femaleMetrics: FemaleMetrics;
  growth: GrowthMetrics;
  matchHealth: MatchHealth;
}

@Injectable()
export class ExecutiveSummaryGenerator {
  generate(input: SummaryInput): ExecutiveSummary {
    const critical = input.alerts.filter((a) => a.severity === 'critical');
    const headline =
      critical.length > 0
        ? `${critical.length} هشدار بحرانی نیازمند توجه فوری`
        : `وضعیت کلی پایدار — DAU: ${input.growth.dau.current} | نرخ Match: ${input.matchHealth.matchRate.current}٪`;

    return {
      headline,
      topRisks: input.alerts
        .filter((a) => a.severity === 'critical' || a.severity === 'high')
        .slice(0, 3)
        .map((a) => a.title),
      topOpportunities: input.recommendations
        .filter((r) => r.expectedImpact >= 20)
        .slice(0, 3)
        .map((r) => r.title),
      topRecommendations: input.recommendations.slice(0, 3),
      generatedAt: new Date(),
    };
  }
}
