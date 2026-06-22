import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

const createCampaign = (data: any) =>
  apiClient.post("/growth/campaigns", data).then((r) => r.data);
const forecastTraffic = (payload: { historicalData: any[]; days?: number }) =>
  apiClient.post("/growth/campaigns/forecast", payload).then((r) => r.data);
const sendCampaignFeedback = (data: any) =>
  apiClient.post("/growth/campaigns/feedback", data).then((r) => r.data);

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      toast.success("کمپین جدید ایجاد شد");
      qc.invalidateQueries({ queryKey: ["growth", "campaigns"] });
    },
    onError: () => toast.error("خطا در ایجاد کمپین"),
  });
};

export const useForecastTraffic = () =>
  useMutation({ mutationFn: forecastTraffic });

export const useSendCampaignFeedback = () =>
  useMutation({ mutationFn: sendCampaignFeedback });
