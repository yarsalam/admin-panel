import apiClient from "@/lib/api/client";

export const fetchFeed = (
  userId: number,
  params?: { limit?: number; city?: string },
) =>
  apiClient
    .get("/product/feed-simulator", { params: { userId, ...params } })
    .then((r) => r.data);
