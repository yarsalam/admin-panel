import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// ========== تایپ‌ها ==========
export interface DashboardKPIs {
  totalUsers: number;
  totalRevenue: number;
  growthRate: number;
  feedbackScore: number;
}

export interface PhaseDistribution {
  name: string;
  value: number;
}

export interface Alert {
  type: "critical" | "warning";
  message: string;
  timestamp: string;
}

export interface CompetitorRadarItem {
  name: string;
  change: number;
}

// ========== هوک‌ها ==========
export const useDashboardKPIs = () => {
  return useQuery<DashboardKPIs>({
    queryKey: ["exec", "dashboard", "kpis"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/kpis");
      return data;
    },
    refetchInterval: 30000, // هر ۳۰ ثانیه
  });
};

export const usePhaseDistribution = () => {
  return useQuery<PhaseDistribution[]>({
    queryKey: ["exec", "dashboard", "phase-distribution"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/exec/dashboard/phase-distribution",
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAlerts = () => {
  return useQuery<Alert[]>({
    queryKey: ["exec", "dashboard", "alerts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/alerts");
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useCompetitorRadar = () => {
  return useQuery<CompetitorRadarItem[]>({
    queryKey: ["exec", "dashboard", "competitor-radar"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/competitor-radar");
      return data;
    },
    staleTime: 15 * 60 * 1000,
  });
};
