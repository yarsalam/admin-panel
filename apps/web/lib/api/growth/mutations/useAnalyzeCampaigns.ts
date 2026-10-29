import { useQuery } from "@tanstack/react-query";
import { fetchAnalyzeCampaigns } from "../queries/useCampaigns";

export const useAnalyzeCampaigns = () =>
  useQuery({
    queryKey: ["growth", "campaigns", "analyze"],
    queryFn: fetchAnalyzeCampaigns,
    enabled: false, // صدا زدن دستی
  });
