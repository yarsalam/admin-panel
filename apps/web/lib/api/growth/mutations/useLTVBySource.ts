import { useQuery } from "@tanstack/react-query";
import { getLTVBySource } from "../queries/useCampaigns";

export const useLTVBySource = () =>
  useQuery({
    queryKey: ["growth", "ltv-by-source"],
    queryFn: getLTVBySource,
  });
