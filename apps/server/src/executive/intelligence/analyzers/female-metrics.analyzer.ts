// مسیر: apps/server/src/executive/intelligence/analyzers/female-metrics.analyzer.ts
import { Injectable } from '@nestjs/common';
import { FemaleMetrics, HealthScore } from 'src/interfaces';

// RawSnapshot پس از بازنویسی controller، retention را آماده می‌دهد
export interface FemaleRaw {
  totalActiveUsers: number;
  genderCounts: { gender: string; cnt: string }[];
  activeGenderCounts: { gender: string; cnt: string }[];
  verifiedFemaleCount: number;
  retentionD7: number;
  femaleRetentionD7: number;
  femaleRetentionD30: number;
  femaleMatchReceivers: number;
  activeFemaleBase: number;
  activeFemale7d: number;
  activeFemalePrev7d: number;
  newFemaleThisWeek: number;
}

@Injectable()
export class FemaleMetricsAnalyzer {
  analyze(raw: FemaleRaw): FemaleMetrics {
    const byGender = (arr: { gender: string; cnt: string }[], g: string) =>
      parseInt(arr.find((r) => r.gender === g)?.cnt || '0', 10);

    const activeFemale = byGender(raw.activeGenderCounts, 'female');
    const activeMale = byGender(raw.activeGenderCounts, 'male');
    const totalFemale = byGender(raw.genderCounts, 'female');
    const totalActive = raw.totalActiveUsers || 1;
    const activeTotal = activeFemale + activeMale || 1;

    // ✅ همه تقسیم‌ها محافظت شده‌اند
    const femaleRatio = Math.round((activeFemale / totalActive) * 100);
    const activeFemaleRatio = Math.round((activeFemale / activeTotal) * 100);
    const verifiedFemaleRatio =
      totalFemale > 0
        ? Math.round((raw.verifiedFemaleCount / totalFemale) * 100)
        : 0;
    const femaleMatchSuccessRate =
      raw.activeFemaleBase > 0
        ? Math.round((raw.femaleMatchReceivers / raw.activeFemaleBase) * 100)
        : 0;
    const femaleGrowth7d =
      raw.activeFemalePrev7d > 0
        ? Math.round(
            ((raw.activeFemale7d - raw.activeFemalePrev7d) /
              raw.activeFemalePrev7d) *
              100,
          )
        : 0;

    return {
      femaleActiveUsers: activeFemale,
      femaleRatio,
      activeFemaleRatio,
      verifiedFemaleRatio,
      femaleRetentionD7: raw.femaleRetentionD7, // ← از controller می‌آید (آماده)
      femaleRetentionD30: raw.femaleRetentionD30,
      femaleMatchSuccessRate,
      femaleGrowth7d,
      newFemaleThisWeek: raw.newFemaleThisWeek,
      healthScore: this.scoreHealth(
        femaleRatio,
        raw.femaleRetentionD30,
        verifiedFemaleRatio,
      ),
    };
  }

  private scoreHealth(
    ratio: number,
    retention: number,
    verified: number,
  ): HealthScore {
    const score = ratio * 0.5 + retention * 0.3 + verified * 0.2;
    if (score < 10) return 'critical';
    if (score < 20) return 'poor';
    if (score < 30) return 'fair';
    if (score < 45) return 'good';
    return 'excellent';
  }
}
