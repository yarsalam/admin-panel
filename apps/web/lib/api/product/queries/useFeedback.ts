import apiClient from "@/lib/api/client";

export const getMetrics = () =>
  apiClient.get("/product/feedback/metrics").then((r) => r.data);

export const getConversionInsights = () =>
  apiClient.get("/product/feedback/conversion-insights").then((r) => r.data);

export const getTopFeatures = () =>
  apiClient.get("/product/feedback/top-features").then((r) => r.data);

export const listFeedback = (limit: number = 100) =>
  apiClient
    .get("/product/feedback/list", { params: { limit } })
    .then((r) => r.data);
