import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

export interface RevenueOverview {
  ltvBySource: Record<string, number>;
  monthlyRevenue: { month: string; amount: number }[];
}

export interface RevenueForecast {
  forecast: { date: string; predicted: number }[];
  confidence: number;
}

export interface Anomaly {
  id: string;
  date: string;
  severity: "low" | "medium" | "high";
  description: string;
  actual: number;
  expected: number;
}

export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  impact: number;
  roi: number;
}

export const useRevenueOverview = () => {
  return useQuery<RevenueOverview>({
    queryKey: ["exec", "revenue", "overview"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/overview");
      return data;
    },
    staleTime: 15 * 60 * 1000,
  });
};

export const useRevenueForecast = (days: number = 90) => {
  return useQuery<RevenueForecast>({
    queryKey: ["exec", "revenue", "forecast", days],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/forecast?days=${days}`);
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
};

export const useAnomalies = () => {
  return useQuery<Anomaly[]>({
    queryKey: ["exec", "revenue", "anomalies"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/anomalies");
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useStrategicDecisions = () => {
  return useQuery<StrategicDecision[]>({
    queryKey: ["exec", "revenue", "strategic"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/strategic");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
};