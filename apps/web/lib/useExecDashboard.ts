import { useQuery } from "@tanstack/react-query";
import apiClient from "./api/client";

export function useExecDashboard() {
  return useQuery({
    queryKey: ["exec", "dashboard"],
    queryFn: () => apiClient.get("/exec/dashboard").then((res) => res.data),
  });
}
