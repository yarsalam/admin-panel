import apiClient from "@/lib/api/client";

export const fetchCampaigns = () =>
  apiClient.get("/growth/campaigns").then((r) => r.data);

export const fetchAnalyzeCampaigns = () =>
  apiClient.get("/growth/campaigns/analyze").then((r) => r.data);

export const fetchLTVBySource = () =>
  apiClient.get("/growth/campaigns/ltv-by-source").then((r) => r.data);

/** Backwards-compatible names used by the existing growth hooks. */
export const analyzeCampaigns = fetchAnalyzeCampaigns;
export const getLTVBySource = fetchLTVBySource;
