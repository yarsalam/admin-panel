import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

const analyzeImage = (url: string) =>
  apiClient
    .post("/product/feed-simulator/analyze-image", { url })
    .then((r) => r.data);

export const useAnalyzeImage = () => useMutation({ mutationFn: analyzeImage });
