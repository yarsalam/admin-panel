import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

export function useBusinessScore() {
  return useQuery({
    queryKey: ["exec", "intelligence", "business-score"],
    queryFn: () =>
      apiClient.get("/exec/intelligence/business-score").then((r) => r.data),
    refetchInterval: 60_000,
  });
}
