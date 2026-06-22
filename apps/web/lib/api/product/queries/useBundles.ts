import apiClient from "@/lib/api/client";

export const getBundles = () =>
  apiClient.get("/product/bundles").then((r) => r.data);
