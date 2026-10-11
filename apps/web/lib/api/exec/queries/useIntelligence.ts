import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// ========== تایپ‌ها (هم‌راستا با بک‌اند exec/intelligence) ==========
export interface BusinessScoreBreakdown {
  revenue: number;
  retention: number;
  feedback: number;
  infrastructure: number;
}

export interface BusinessScoreTrend {
  previous: number;
  change: number;
  direction: "up" | "down" | "stable";
}

export interface BusinessScore {
  total: number;
  breakdown: BusinessScoreBreakdown;
  trend: BusinessScoreTrend;
  weights: BusinessScoreBreakdown;
}

export type RecommendationDomain =
  | "revenue"
  | "seo"
  | "users"
  | "ai"
  | "infrastructure";

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  domain: RecommendationDomain;
  title: string;
  description: string;
  expectedImpact: number;
  priority: RecommendationPriority;
  action: string;
  confidence?: number;
  createdAt?: string;
}

export interface DecisionAccuracy {
  accuracy: number;
  avgRoi: number;
  count: number;
}

export interface IntelligenceSummary {
  score: BusinessScore | null;
  topRecommendations: Recommendation[];
  decisionAccuracy: DecisionAccuracy | null;
  timestamp: string;
}

// ========== هوک‌ها ==========

// امتیاز سلامت کسب‌وکار (Business Health Score) — قلب صفحه‌ی اصلی
export function useBusinessScore() {
  return useQuery<BusinessScore>({
    queryKey: ["exec", "intelligence", "business-score"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/intelligence/business-score");
      return data;
    },
    refetchInterval: 60_000,
  });
}

// لیست توصیه‌های اولویت‌بندی‌شده (تا ۱۰ مورد، از ۶ analyzer)
export function useTopRecommendations() {
  return useQuery<Recommendation[]>({
    queryKey: ["exec", "intelligence", "recommendations"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/exec/intelligence/top-recommendations",
      );
      return data;
    },
    refetchInterval: 60_000,
  });
}

// یک endpoint که همه چیز را با هم می‌آورد (برای لودینگ سریع‌تر صفحه‌ی اصلی)
export function useIntelligenceSummary() {
  return useQuery<IntelligenceSummary>({
    queryKey: ["exec", "intelligence", "summary"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/intelligence/summary");
      return data;
    },
    refetchInterval: 60_000,
  });
}
