import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../client";
import {
  campaignSchema,
  referralStatsSchema,
  topReferrerSchema,
} from "@/schemas/growth/referral";
import toast from "react-hot-toast";

// کمپین‌ها
export function useReferralCampaigns() {
  return useQuery({
    queryKey: ["growth", "referrals", "campaigns"],
    queryFn: () =>
      apiClient
        .get("/growth/referrals/campaigns")
        .then((r) => z.array(campaignSchema).parse(r.data)),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post("/growth/referrals/campaigns", data),
    onSuccess: () => {
      toast.success("کمپین جدید ایجاد شد");
      qc.invalidateQueries({ queryKey: ["growth", "referrals", "campaigns"] });
    },
  });
}

// آمار
export function useReferralStats() {
  return useQuery({
    queryKey: ["growth", "referrals", "stats"],
    queryFn: () =>
      apiClient
        .get("/growth/referrals/stats")
        .then((r) => referralStatsSchema.parse(r.data)),
  });
}

export function useTopReferrers(limit = 10) {
  return useQuery({
    queryKey: ["growth", "referrals", "top", limit],
    queryFn: () =>
      apiClient
        .get(`/growth/referrals/top-referrers?limit=${limit}`)
        .then((r) => z.array(topReferrerSchema).parse(r.data)),
  });
}
