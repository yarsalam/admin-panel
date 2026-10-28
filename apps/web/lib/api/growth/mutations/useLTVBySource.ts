import { useQuery } from "@tanstack/react-query";
import { fetchLTVBySource } from "../queries/useCampaigns";

export const useLTVBySource = () =>
  useQuery({
    queryKey: ["growth", "ltv-by-source"],
    queryFn: fetchLTVBySource,
  });
