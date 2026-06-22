import { useQuery } from "@tanstack/react-query";
import { analyzeCampaigns } from "../queries/useCampaigns";

export const useAnalyzeCampaigns = () =>
  useQuery({
    queryKey: ["growth", "campaigns", "analyze"],
    queryFn: analyzeCampaigns,
    enabled: false, // صدا زدن دستی
  });
