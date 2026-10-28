export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Trend = 'up' | 'down' | 'stable';
export type HealthScore = 'critical' | 'poor' | 'fair' | 'good' | 'excellent';

export interface KPIValue {
  current: number;
  previous: number;
  deltaPercent: number;
  direction: Trend;
  target?: number;
}

// ─── Female Metrics ───────────────────────────────────────────────────────────
export interface FemaleMetrics {
  femaleActiveUsers: number;
  femaleRatio: number;
  activeFemaleRatio: number;
  verifiedFemaleRatio: number;
  femaleRetentionD7: number;
  femaleGrowth7d: number;
  femaleRetentionD30: number;
  femaleMatchSuccessRate: number;
  newFemaleThisWeek: number;
  healthScore: HealthScore;
}

// ─── Growth Metrics ───────────────────────────────────────────────────────────
export interface GrowthMetrics {
  dau: KPIValue;
  mau: KPIValue;
  dauMauRatio: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  retentionD7: KPIValue;
  retentionD30: KPIValue;
}

// ─── Retention (چند cohort واقعی) ────────────────────────────────────────────
export interface RetentionCohort {
  label: string; // 'D1' | 'D7' | 'D14' | 'D30' | 'D60' | 'D90'
  days: number;
  rate: number; // درصد ۰-۱۰۰
  cohortSize: number;
  returned: number;
}

export interface RetentionMetrics {
  cohorts: RetentionCohort[];
  femaleVsMale: { femaleD30: number; maleD30: number };
  premiumVsFree: { premiumD30: number; freeD30: number };
}

// ─── Dating Funnel ────────────────────────────────────────────────────────────
export interface FunnelStep {
  step: string;
  label: string;
  count: number;
  conversionFromPrevious: number | null;
  dropRate: number;
  isBottleneck: boolean;
  rootCause?: string;
  suggestion?: string;
}

export interface DatingFunnel {
  steps: FunnelStep[];
  overallConversion: number;
  criticalBottleneck: boolean;
  period: 'last_30_days';
}

// ─── Match Health ─────────────────────────────────────────────────────────────
export interface MatchHealth {
  matchRate: KPIValue;
  conversationRate: KPIValue;
  replyRate: KPIValue;
  readRate: KPIValue;
  firstMessageSuccessRate: number;
  avgMessagesPerMatch: number;
  ghostingRate: number; // مکالمه‌هایی که بعد از یک پیام قطع شده‌اند
  qualityScore: number;
}

// ─── Marketplace Health ───────────────────────────────────────────────────────
export interface MarketplaceMetrics {
  maleFemaleRatio: number; // نسبت مرد به زن
  femaleDemandScore: number; // چقدر مردها زنان را لایک می‌کنند
  maleDemandScore: number; // چقدر زنان مردان را لایک می‌کنند
  unansweredLikesRatio: number; // لایک‌هایی که هرگز Match نشدند
  supplyDemandBalance: number; // ۰-۱۰۰، ۵۰ = متوازن
  marketHealthScore: number; // امتیاز کلی بازار ۰-۱۰۰
  activeFemale30d: number; // 🆕
  activeMale30d: number; // 🆕
}

// ─── Engagement Metrics ───────────────────────────────────────────────────────
export interface EngagementMetrics {
  avgSessionsPerUser: number;
  avgLikesPerUser: number;
  avgMessagesPerUser: number;
  dau7dAvg: number; // میانگین DAU هفت روز گذشته
  peakHour: number; // ساعت اوج فعالیت (۰-۲۳)
  engagementScore: number; // ۰-۱۰۰
}

// ─── Monetization Metrics ─────────────────────────────────────────────────────
export interface MonetizationMetrics {
  mrr: KPIValue;
  arr: number;
  arpu: number;
  arppu: number; // Average Revenue Per Paying User
  ltv: number;
  cac: number; // Customer Acquisition Cost (placeholder)
  paybackPeriodMonths: number;
  conversionRate: number; // free → premium
  renewalRate: number; // تمدید اشتراک
  churnRate: number;
  refundRate: number;
  revenuePerFemale: number;
  revenuePerMale: number;
  totalThisMonth: number;
}

// ─── Revenue Metrics (ساده برای backward compat) ──────────────────────────────
export interface RevenueMetrics {
  mrr: KPIValue;
  arpu: number;
  conversionRate: number;
  churnRate: number;
  ltv: number;
  totalThisMonth: number;
}

// ─── Safety Metrics ───────────────────────────────────────────────────────────
export interface SafetyMetrics {
  reportsToday: number;
  pendingModeration: number;
  autoBlocked: number;
  fakeProfiles: number;
  highRiskUsers: number;
  verifiedProfiles: number;
}

// ─── Segment Analysis ─────────────────────────────────────────────────────────
export interface UserSegment {
  name: string;
  label: string;
  count: number;
  percentage: number;
  avgRetentionD30: number; // واقعی از DB
  avgMatchRate: number; // واقعی از DB
}

export interface SegmentAnalysis {
  byPhase: UserSegment[];
  byTier: UserSegment[];
  byCity: UserSegment[];
}

// ─── Business Score ───────────────────────────────────────────────────────────
export interface BusinessScore {
  /** Indicates whether current operational data is sufficient to interpret the score. */
  dataStatus: 'available' | 'insufficient_data';
  total: number;
  breakdown: {
    femaleHealth: number;
    matching: number;
    retention: number;
    revenue: number;
    safety: number;
  };
  weights: {
    femaleHealth: number;
    matching: number;
    retention: number;
    revenue: number;
    safety: number;
  };
  trend: Trend;
  previous: number;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  severity: Severity;
  domain:
    | 'gender'
    | 'growth'
    | 'retention'
    | 'matching'
    | 'safety'
    | 'revenue'
    | 'users'
    | 'marketplace';
  title: string;
  detail: string;
  triggeredAt: Date;
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export interface Recommendation {
  id: string;
  domain:
    | 'users'
    | 'matching'
    | 'safety'
    | 'revenue'
    | 'seo'
    | 'ai'
    | 'infrastructure';
  priority: Priority;
  title: string;
  description: string;
  rootCause: string;
  expectedImpact: number;
  impactLabel: string;
  confidence: number;
  action: string;
  createdAt: Date;
}

// ─── Executive Summary ────────────────────────────────────────────────────────
export interface ExecutiveSummary {
  headline: string;
  topRisks: string[];
  topOpportunities: string[];
  topRecommendations: Recommendation[];
  generatedAt: Date;
}

// ─── Full Report ──────────────────────────────────────────────────────────────
export interface FullIntelligenceReport {
  executiveSummary: ExecutiveSummary;
  businessScore: BusinessScore;
  femaleMetrics: FemaleMetrics;
  growth: GrowthMetrics;
  retention: RetentionMetrics;
  funnel: DatingFunnel;
  matchHealth: MatchHealth;
  marketplace: MarketplaceMetrics;
  engagement: EngagementMetrics;
  monetization: MonetizationMetrics;
  safety: SafetyMetrics;
  segments: SegmentAnalysis;
  revenue: RevenueMetrics;
  alerts: Alert[];
  recommendations: Recommendation[];
  generatedAt: string;
  northStar: {
    meaningfulConversations: number;
    target: number;
  };
}
