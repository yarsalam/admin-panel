import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

const setPhaseWeight = (key: string, value: number) =>
  apiClient
    .post("/product/algorithm-tuning/phase-weights", { key, value })
    .then((r) => r.data);

const updateFeatureWeight = (type: string, index: number, value: number) =>
  apiClient
    .post("/product/algorithm-tuning/feature-weights", { type, index, value })
    .then((r) => r.data);

const updateDiversityParams = (params: any) =>
  apiClient
    .post("/product/algorithm-tuning/diversity", params)
    .then((r) => r.data);

export const useSetPhaseWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: number }) =>
      setPhaseWeight(key, value),
    onSuccess: () => {
      toast.success("وزن فاز با موفقیت به‌روز شد");
      qc.invalidateQueries({ queryKey: ["phase-weights"] });
    },
    onError: () => toast.error("خطا در به‌روزرسانی وزن"),
  });
};

export const useUpdateFeatureWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      index,
      value,
    }: {
      type: string;
      index: number;
      value: number;
    }) => updateFeatureWeight(type, index, value),
    onSuccess: () => {
      toast.success("وزن ویژگی به‌روز شد");
      qc.invalidateQueries({ queryKey: ["feature-weights", "main"] });
    },
    onError: () => toast.error("خطا در به‌روزرسانی ویژگی"),
  });
};

export const useUpdateDiversityParams = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDiversityParams,
    onSuccess: () => {
      toast.success("پارامترهای تنوع ذخیره شد");
      qc.invalidateQueries({ queryKey: ["diversity"] });
    },
  });
};
