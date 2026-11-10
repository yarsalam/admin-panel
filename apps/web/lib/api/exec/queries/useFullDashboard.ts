import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const fetchFullDashboard = async () => {
  const { data } = await apiClient.get("/exec/dashboard");
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String(data.error || "داده‌های داشبورد در دسترس نیستند"));
  }
  return data;
};

export const useFullDashboard = () =>
  useQuery({
    queryKey: ["exec", "dashboard", "full"],
    queryFn: fetchFullDashboard,
    staleTime: 60 * 1000,
    retry: 1,
  });
