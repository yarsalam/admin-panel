import apiClient from "@/lib/api/client";

export const fetchContentIdeas = () =>
  apiClient.get("/growth/seo-studio/content-ideas").then((r) => r.data);

export const fetchHighIntentContent = () =>
  apiClient.get("/growth/seo-studio/high-intent-content").then((r) => r.data);

export const fetchBehavioralKeywords = () =>
  apiClient.get("/growth/seo-studio/behavioral-keywords").then((r) => r.data);

export const fetchKeywordRankings = (keyword?: string) =>
  apiClient
    .get("/growth/seo-studio/keyword-rankings", { params: { keyword } })
    .then((r) => r.data);

export const fetchSERPFeatures = (keyword: string) =>
  apiClient
    .get(
      `/growth/seo-studio/serp-features?keyword=${encodeURIComponent(keyword)}`,
    )
    .then((r) => r.data);

export const fetchCompetitorAnalysis = () =>
  apiClient.get("/growth/seo-studio/competitor-analysis").then((r) => r.data);

export const fetchCompetitorChanges = () =>
  apiClient.get("/growth/seo-studio/competitor-changes").then((r) => r.data);

export const fetchAIRecommendations = () =>
  apiClient.get("/growth/seo-studio/ai-recommendations").then((r) => r.data);

export const fetchGoogleTrends = (keyword: string, geo?: string) =>
  apiClient
    .get("/growth/seo-studio/google-trends", { params: { keyword, geo } })
    .then((r) => r.data);

export const fetchKeywordGap = (domain: string, competitors: string[]) =>
  apiClient
    .post("/growth/seo-studio/keyword-gap", { domain, competitors })
    .then((r) => r.data);
