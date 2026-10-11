import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

export const scanTelegram = () =>
  apiClient.post("/growth/social/scan-telegram").then((r) => r.data);
export const analyzeTexts = (texts: string[]) =>
  apiClient.post("/growth/social/analyze-texts", texts).then((r) => r.data);

export const useScanTelegram = () =>
  useMutation({
    mutationFn: scanTelegram,
    onSuccess: () => toast.success("اسکن تلگرام با موفقیت انجام شد"),
    onError: () => toast.error("خطا در اسکن"),
  });

export const useAnalyzeTexts = () =>
  useMutation({
    mutationFn: analyzeTexts,
  });
