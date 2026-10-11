import apiClient from "@/lib/api/client";

export const fetchBrandSentiment = (brand: string) =>
  apiClient
    .get(`/growth/social/brand-sentiment?brand=${encodeURIComponent(brand)}`)
    .then((r) => r.data);
