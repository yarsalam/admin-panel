import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

export interface SystemMetric {
  cpu: number;
  memory: number;
  disk: number;
  timestamp: string;
}

export interface SystemIssue {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  service: string;
  message: string;
  startedAt: string;
}

export interface ServiceHealth {
  name: string;
  status: "up" | "down" | "degraded";
  details?: any;
}

export interface SecurityReport {
  vulnerabilities: number;
  lastScan: string;
  riskScore: number;
}

export const useSystemMetrics = () => {
  return useQuery<SystemMetric>({
    queryKey: ["exec", "system-health", "metrics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/system-health/metrics");
      return data;
    },
    refetchInterval: 15000,
  });
};

export const useSystemIssues = () => {
  return useQuery<SystemIssue[]>({
    queryKey: ["exec", "system-health", "issues"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/system-health/issues");
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useServicesHealth = () => {
  return useQuery<ServiceHealth[]>({
    queryKey: ["exec", "system-health", "services"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/system-health/services");
      return data;
    },
    refetchInterval: 60000,
  });
};

export const useSecurityReport = () => {
  return useQuery<SecurityReport>({
    queryKey: ["exec", "system-health", "security"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/system-health/security");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};