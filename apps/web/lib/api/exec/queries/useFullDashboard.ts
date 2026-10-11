import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const fetchFullDashboard = () =>
  apiClient.get("/exec/dashboard").then((r) => r.data);

export const useFullDashboard = () =>
  useQuery({
    queryKey: ["exec", "dashboard", "full"],
    queryFn: fetchFullDashboard,
    staleTime: 60 * 1000,
    retry: 1,
  });
