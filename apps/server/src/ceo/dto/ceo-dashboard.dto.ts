// مسیر: apps/server/src/ceo/dto/ceo-dashboard.dto.ts
import {
  FemaleMetrics, GrowthMetrics, DatingFunnel,
  MatchHealth, SafetyMetrics, SegmentAnalysis,
  RevenueMetrics, BusinessScore, ExecutiveSummary,
  Alert, Recommendation,
} from 'src/interfaces';

export interface CeoSummaryDto {
  executiveSummary: ExecutiveSummary;
  businessScore: BusinessScore;
  femaleMetrics: FemaleMetrics;
  growth: GrowthMetrics;
  funnel: DatingFunnel;
  matchHealth: MatchHealth;
  safety: SafetyMetrics;
  segments: SegmentAnalysis;
  revenue: RevenueMetrics;
  alerts: Alert[];
  recommendations: Recommendation[];
  generatedAt: string;
}

// KPI های بالای صفحه برای polling سریع (هر ۶۰ ثانیه)
export interface CeoTopKPIsDto {
  femaleActiveUsers: number;
  femaleRatio: number;
  femaleHealthScore: string;
  dau: number;
  matchRate: number;
  businessScore: number;
  criticalAlerts: number;
  generatedAt: string;
}
