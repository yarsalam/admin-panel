import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const useKpiDeltas = () =>
  useQuery({
    queryKey: ["exec", "kpi-deltas"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/business-score/deltas");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
