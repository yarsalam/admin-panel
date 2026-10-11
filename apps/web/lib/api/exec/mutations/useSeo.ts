import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeywordRanking {
  keyword: string;
  position: number;
  volume: number;
  trend: "up" | "down" | "stable";
  difficulty?: number;
  ctr?: number;
}

export interface ContentOpportunity {
  keyword: string;
  title: string;
  expectedLTV: number;
  estimatedUsers: number;
  totalRevenue: number;
  priority: number;
}

export interface ContentIdea {
  title: string;
  type: string;
  keywords: string[];
  estimatedTraffic: number;
  priority: string;
  source: string;
  opportunity?: string;
}

export interface BehavioralKeyword {
  keyword: string;
  users: number;
  avgLTV: number;
  avgRetention: number;
  priorityScore: number;
  recommendation: string;
}

export interface CompetitorData {
  competitor: string;
  overlap: number;
  strength: string[];
  traffic?: number;
  threatLevel?: "high" | "medium" | "low";
}

export interface SerpFeature {
  opportunity?: string;
  recommendation?: string;
  message?: string;
}

export interface GoogleTrend {
  // raw google trends data
  default?: {
    timelineData?: Array<{ value: number[]; formattedTime: string }>;
  };
}

export interface CampaignActivity {
  id: number;
  type: string;
  platform: string;
  cost: number;
  results: {
    clicks: number;
    impressions: number;
    registrations: number;
    conversions: number;
    revenue: number;
  };
  roi?: number;
  performedAt: string;
}

export interface TrafficForecast {
  forecast: Array<{
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
  }>;
  growth_rate: number;
  peak_periods: string[];
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useKeywordsRanking = () =>
  useQuery<KeywordRanking[]>({
    queryKey: ["seo", "keywords-ranking"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/keyword-rankings").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useHighIntentContent = () =>
  useQuery<ContentOpportunity[]>({
    queryKey: ["seo", "high-intent-content"],
    queryFn: () =>
      apiClient
        .get("/growth/seo-studio/high-intent-content")
        .then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

export const useContentIdeas = () =>
  useQuery<ContentIdea[]>({
    queryKey: ["seo", "content-ideas"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/content-ideas").then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

export const useBehavioralKeywords = () =>
  useQuery<BehavioralKeyword[]>({
    queryKey: ["seo", "behavioral-keywords"],
    queryFn: () =>
      apiClient
        .get("/growth/seo-studio/behavioral-keywords")
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useCompetitorAnalysis = () =>
  useQuery<CompetitorData[]>({
    queryKey: ["seo", "competitor-analysis"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/competitor-analysis").then((r) => {
        return Array.isArray(r.data) ? r.data : [];
      }),
    staleTime: 15 * 60 * 1000,
  });

export const useSerpFeatures = (keyword: string) =>
  useQuery<SerpFeature>({
    queryKey: ["seo", "serp-features", keyword],
    queryFn: () =>
      apiClient
        .get(
          `/growth/seo-studio/serp-features?keyword=${encodeURIComponent(keyword)}`,
        )
        .then((r) => r.data),
    enabled: !!keyword,
    staleTime: 30 * 60 * 1000,
  });

export const useGoogleTrends = (keyword: string, geo = "IR") =>
  useQuery<GoogleTrend>({
    queryKey: ["seo", "google-trends", keyword, geo],
    queryFn: () =>
      apiClient
        .get(
          `/growth/seo-studio/google-trends?keyword=${encodeURIComponent(keyword)}&geo=${geo}`,
        )
        .then((r) => r.data),
    enabled: !!keyword,
    staleTime: 60 * 60 * 1000,
  });

export const useCampaigns = () =>
  useQuery<CampaignActivity[]>({
    queryKey: ["seo", "campaigns"],
    queryFn: () =>
      apiClient.get("/growth/campaigns").then((r) => {
        // 🆕 اگه آرایه نیست، آرایه خالی برگردون
        return Array.isArray(r.data) ? r.data : [];
      }),
    staleTime: 5 * 60 * 1000,
  });

export const useCompetitorChanges = () =>
  useQuery({
    queryKey: ["seo", "competitor-changes"],
    queryFn: () =>
      apiClient
        .get("/growth/seo-studio/competitor-analysis")
        .then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  });
// 🆕 پیشنهادات واقعی از SEOScoreEngine
export interface SeoRecommendation {
  domain: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
}

export const useSeoRecommendations = () =>
  useQuery<SeoRecommendation[]>({
    queryKey: ["seo", "recommendations"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/recommendations").then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

// 🆕 Revenue Attribution — شکل دقیق خروجی calculateLTVBySource رو ندیدم،
// پنل به‌صورت defensive رندر می‌کنه
export type RevenueAttributionRow = Record<string, any>;

export const useSeoRevenueAttribution = () =>
  useQuery<RevenueAttributionRow[]>({
    queryKey: ["seo", "revenue-attribution"],
    queryFn: () =>
      apiClient.get("/growth/campaigns/ltv-by-source").then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

// 🆕 قیف سئو
export interface SeoFunnelStep {
  step: string;
  label: string;
  count: number | null;
}

export interface SeoFunnel {
  steps: SeoFunnelStep[];
  revenue30d: number;
  impressionsClicksEstimated: boolean;
}

export const useSeoFunnel = () =>
  useQuery<SeoFunnel>({
    queryKey: ["seo", "funnel"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/funnel").then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

// 🆕 مقایسه‌ی ماه‌به‌ماه
export interface SeoMoMMetric {
  current: number;
  previous: number | null;
  deltaPercent: number | null;
}

export interface SeoTrendsMoM {
  campaignRevenue: SeoMoMMetric | null;
  technicalScore: SeoMoMMetric | null;
}

export const useSeoTrendsMoM = () =>
  useQuery<SeoTrendsMoM>({
    queryKey: ["seo", "trends-mom"],
    queryFn: () =>
      apiClient.get("/growth/seo-studio/trends-mom").then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  });

// 🆕 سری روزانه واقعی ثبت‌نام‌ها — Proxy ترافیک برای Forecast خودکار
export interface TrafficProxyPoint {
  date: string;
  traffic: number;
}

export const useTrafficProxyHistory = (days = 90) =>
  useQuery<TrafficProxyPoint[]>({
    queryKey: ["seo", "traffic-proxy-history", days],
    queryFn: () =>
      apiClient
        .get(`/growth/seo-studio/traffic-proxy-history?days=${days}`)
        .then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

export interface SeoFullScoreResponse {
  metrics?: any;
  score?: {
    overall: number;
    grade: string;
    recommendations?: string[];
    breakdown?: {
      technical?: number;
      user?: number;
      campaign?: number;
      competitor?: number;
      aeo?: number;
      recommender?: number;
      backlink?: number;
    };
  };
}

export const useSeoFullScore = () => {
  return useQuery({
    queryKey: ["seo-full-score"],
    queryFn: async () => {
      const res = await apiClient.get("/growth/seo-studio/full-score");
      return res.data as SeoFullScoreResponse;
    },
  });
};

export const useSeoSummary = () =>
  useQuery({
    queryKey: ["seo", "executive-summary"],
    queryFn: () =>
      apiClient.get("/exec/dashboard/seo-widget").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
