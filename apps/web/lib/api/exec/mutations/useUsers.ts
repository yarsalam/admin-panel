import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const useChurnSummary = () =>
  useQuery({
    queryKey: ["users", "churn-summary"],
    queryFn: () =>
      apiClient.get("/users/intelligence/churn-summary").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useAtRiskUsers = (threshold = 0.7, limit = 100) =>
  useQuery({
    queryKey: ["users", "at-risk", threshold, limit],
    queryFn: () =>
      apiClient
        .get(
          `/users/intelligence/at-risk?threshold=${threshold}&limit=${limit}`,
        )
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useCohorts = (weeks = 8) =>
  useQuery({
    queryKey: ["users", "cohorts", weeks],
    queryFn: () =>
      apiClient
        .get(`/users/intelligence/cohorts?weeks=${weeks}`)
        .then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  });
