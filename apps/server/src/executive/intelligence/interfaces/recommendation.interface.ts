export type RecommendationDomain =
  | 'revenue'
  | 'seo'
  | 'users'
  | 'ai'
  | 'infrastructure';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  domain: RecommendationDomain;
  title: string;
  description: string;
  expectedImpact: number;
  priority: RecommendationPriority;
  action: string;
  confidence?: number; // 0-1
  createdAt?: Date;
}

export interface BusinessScoreBreakdown {
  revenue: number;
  retention: number;
  feedback: number;
  infrastructure: number;
}

export interface BusinessScore {
  total: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  breakdown: BusinessScoreBreakdown;
  generatedAt: string;
}
