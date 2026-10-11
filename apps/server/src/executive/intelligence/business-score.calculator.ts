import { Injectable } from '@nestjs/common';
import {
  BusinessScore,
  FemaleMetrics,
  MatchHealth,
  GrowthMetrics,
  RevenueMetrics,
  SafetyMetrics,
  Trend,
} from 'src/interfaces';

interface ScoreInput {
  femaleMetrics: FemaleMetrics;
  matchHealth: MatchHealth;
  growth: GrowthMetrics;
  revenue: RevenueMetrics;
  safety: SafetyMetrics;
}

@Injectable()
export class BusinessScoreCalculator {
  private readonly weights = {
    femaleHealth: 0.3,
    matching: 0.25,
    retention: 0.2,
    revenue: 0.15,
    safety: 0.1,
  };

  calculate(input: ScoreInput): BusinessScore {
    const femaleHealth = this.mapHealth(input.femaleMetrics.healthScore);
    const matching = Math.min(100, input.matchHealth.qualityScore);
    const retention = Math.min(100, input.growth.retentionD30.current * 3);
    const revenue = Math.min(100, input.revenue.conversionRate * 10);
    const totalUsers =
      input.safety.verifiedProfiles + input.safety.highRiskUsers || 1;
    const safety = Math.max(
      0,
      100 - Math.round((input.safety.highRiskUsers / totalUsers) * 100),
    );

    const breakdown = { femaleHealth, matching, retention, revenue, safety };

    const total = Math.round(
      femaleHealth * this.weights.femaleHealth +
        matching * this.weights.matching +
        retention * this.weights.retention +
        revenue * this.weights.revenue +
        safety * this.weights.safety,
    );

    const previous = total;
    const trend: Trend = 'stable';

    return { total, breakdown, weights: this.weights, trend, previous };
  }

  private mapHealth(h: FemaleMetrics['healthScore']): number {
    return { critical: 20, poor: 40, fair: 60, good: 80, excellent: 100 }[h];
  }
}
