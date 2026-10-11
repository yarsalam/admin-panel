import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface SystemHealthOverview {
  system: {
    cpu: { average: number; count: number; percent_per_core: number[] };
    memory: { total_gb: number; used_gb: number; percent: number };
    disk: { total_gb: number; used_gb: number; percent: number };
  } | null;
  app: {
    avg_response_time: number;
    error_rate: number;
    is_available: boolean;
    sample_size?: number;
  };
  issues: Array<{
    type: string;
    value: number;
    threshold: number;
    severity: "warning" | "critical";
    impact: string;
    suggestion: string;
    revenue_impact: number;
    detected_at: string;
  }>;
  lastUpdated: string | null;
  dataAvailable: boolean;
}

export interface ServiceStatus {
  name: string;
  status: "up" | "down" | "degraded";
  latencyMs: number | null;
}

const REFRESH_INTERVAL_MS = 30_000; // ai_ops هر 60 ثانیه جمع می‌کنه؛ 30 ثانیه رفرش کافیه بدون فشار اضافه

export function useSystemHealthOverview() {
  return useQuery<SystemHealthOverview>({
    queryKey: ["system-health", "overview"],
    queryFn: () =>
      apiClient
        .get("/infrastructure/system-health/overview")
        .then((r) => r.data),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useServicesStatus() {
  return useQuery<ServiceStatus[]>({
    queryKey: ["system-health", "services-status"],
    queryFn: () =>
      apiClient
        .get("/infrastructure/system-health/services-status")
        .then((r) => r.data),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
