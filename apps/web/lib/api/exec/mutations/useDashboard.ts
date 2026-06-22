import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// در صورت نداشتن schema، فعلاً بدون اعتبارسنجی برگردانید
// یا اگر schema دارید، از آن استفاده کنید – اما برای رفع سریع خطا، بدون schema کار می‌کند.

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ["exec", "dashboard", "kpis"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/kpis");
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePhaseDistribution() {
  return useQuery({
    queryKey: ["exec", "dashboard", "phase-distribution"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/phase-distribution");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["exec", "dashboard", "alerts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/alerts");
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useCompetitorRadar() {
  return useQuery({
    queryKey: ["exec", "dashboard", "competitor-radar"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/dashboard/competitor-radar");
      return data;
    },
    staleTime: 15 * 60 * 1000,
  });
}