import apiClient from "@/lib/api/client";

export const getPhaseWeights = () =>
  apiClient.get("/product/algorithm-tuning/phase-weights").then((r) => r.data);

export const getFeatureWeights = (type: string) =>
  apiClient
    .get("/product/algorithm-tuning/feature-weights", { params: { type } })
    .then((r) => r.data);

export const getDiversityParams = () =>
  apiClient.get("/product/algorithm-tuning/diversity").then((r) => r.data);

export const testScores = (userId: number, candidateIds: number[]) =>
  apiClient
    .post("/product/algorithm-tuning/test-scores", { userId, candidateIds })
    .then((r) => r.data);

export const getUserFeatures = (userId: number) =>
  apiClient
    .get("/product/algorithm-tuning/user-features", { params: { userId } })
    .then((r) => r.data);
