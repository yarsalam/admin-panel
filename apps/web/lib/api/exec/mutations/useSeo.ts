import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

export interface KeywordRanking {
  keyword: string;
  position: number;
  volume: number;
  trend: "up" | "down" | "stable";
}

export interface ContentOpportunity {
  title: string;
  score: number;
  volume: number;
  difficulty: number;
}

export interface CompetitorAnalysis {
  competitor: string;
  overlap: number;
  strength: string[];
}

export interface SeoRecommendation {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  effort: number;
}

export const useKeywordsRanking = () => {
  return useQuery<KeywordRanking[]>({
    queryKey: ["exec", "seo", "keywords"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/seo/keywords");
      return data;
    },
    staleTime: 60 * 60 * 1000, // ۱ ساعت
  });
};

export const useContentOpportunities = () => {
  return useQuery<ContentOpportunity[]>({
    queryKey: ["exec", "seo", "opportunities"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/seo/opportunities");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
};

export const useCompetitorAnalysis = () => {
  return useQuery<CompetitorAnalysis[]>({
    queryKey: ["exec", "seo", "competitors"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/seo/competitors");
      return data;
    },
    staleTime: 12 * 60 * 60 * 1000,
  });
};

export const useSeoRecommendations = () => {
  return useQuery<SeoRecommendation[]>({
    queryKey: ["exec", "seo", "recommendations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/seo/recommendations");
      return data;
    },
    staleTime: 6 * 60 * 60 * 1000,
  });
};

export const useSERPFeatures = (keyword: string) => {
  return useQuery({
    queryKey: ["exec", "seo", "serp", keyword],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/exec/seo/serp-features?keyword=${encodeURIComponent(keyword)}`,
      );
      return data;
    },
    enabled: !!keyword,
    staleTime: 24 * 60 * 60 * 1000,
  });
};
