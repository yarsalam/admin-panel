import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

const trainIncremental = (feedback: any) =>
  apiClient
    .post("/product/feedback/train-incremental", feedback)
    .then((r) => r.data);

const trainBatch = (feedbacks: any[]) =>
  apiClient
    .post("/product/feedback/train-batch", feedbacks)
    .then((r) => r.data);

const predictConversion = (feedback: any) =>
  apiClient.post("/product/feedback/predict", feedback).then((r) => r.data);

export const useTrainIncremental = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trainIncremental,
    onSuccess: () => {
      toast.success("مدل با نمونه جدید به‌روز شد");
      qc.invalidateQueries({ queryKey: ["feedback", "metrics"] });
    },
    onError: () => toast.error("خطا در آموزش مدل"),
  });
};

export const useTrainBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trainBatch,
    onSuccess: () => {
      toast.success("آموزش دسته‌ای با موفقیت انجام شد");
      qc.invalidateQueries({ queryKey: ["feedback", "metrics"] });
    },
    onError: () => toast.error("خطا در آموزش دسته‌ای"),
  });
};

export const usePredictConversion = () =>
  useMutation({ mutationFn: predictConversion });
