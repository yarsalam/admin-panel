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
    // A zero-only snapshot is not a meaningful health score. This guards
    // against empty datasets and APIs that safely convert query failures to zero.
    const observedSignals = [
      input.femaleMetrics.femaleActiveUsers,
      input.growth.dau.current,
      input.growth.mau.current,
      input.growth.newUsersToday,
      input.growth.newUsersThisWeek,
      input.matchHealth.matchRate.current,
      input.matchHealth.conversationRate.current,
      input.matchHealth.replyRate.current,
      input.revenue.mrr.current,
      input.revenue.conversionRate,
      input.safety.verifiedProfiles,
      input.safety.highRiskUsers,
      input.safety.reportsToday,
      input.safety.pendingModeration,
    ];
    const hasOperationalData = observedSignals.some(
      (value) => Number.isFinite(value) && value > 0,
    );

    const femaleHealth = hasOperationalData
      ? this.mapHealth(input.femaleMetrics.healthScore)
      : 0;
    const matching = hasOperationalData
      ? Math.min(100, input.matchHealth.qualityScore)
      : 0;
    const retention = hasOperationalData
      ? Math.min(100, input.growth.retentionD30.current * 3)
      : 0;
    const revenue = hasOperationalData
      ? Math.min(100, input.revenue.conversionRate * 10)
      : 0;
    const totalUsers =
      input.safety.verifiedProfiles + input.safety.highRiskUsers;
    // Missing denominator means the safety score is unknown, not 100.
    const safety =
      totalUsers > 0
        ? Math.max(
            0,
            100 -
              Math.round(
                (input.safety.highRiskUsers / totalUsers) * 100,
              ),
          )
        : 0;

    const breakdown = { femaleHealth, matching, retention, revenue, safety };

    const total = hasOperationalData
      ? Math.round(
          femaleHealth * this.weights.femaleHealth +
            matching * this.weights.matching +
            retention * this.weights.retention +
            revenue * this.weights.revenue +
            safety * this.weights.safety,
        )
      : 0;

    const previous = total;
    const trend: Trend = 'stable';

    return {
      total,
      breakdown,
      weights: this.weights,
      trend,
      previous,
      dataStatus: hasOperationalData ? 'available' : 'insufficient_data',
    };
  }

  private mapHealth(h: FemaleMetrics['healthScore']): number {
    return { critical: 20, poor: 40, fair: 60, good: 80, excellent: 100 }[h];
  }
}
