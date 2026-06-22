import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

export const runAB = (userId: number, variantA: string, variantB: string) =>
  apiClient
    .post("/product/experiments/run-ab", { userId, variantA, variantB })
    .then((r) => r.data);

export const useRunAB = () =>
  useMutation({
    mutationFn: ({
      userId,
      variantA,
      variantB,
    }: {
      userId: number;
      variantA: string;
      variantB: string;
    }) => runAB(userId, variantA, variantB),
    onSuccess: () => toast.success("نتایج آزمایش A/B دریافت شد"),
    onError: () => toast.error("خطا در اجرای آزمایش"),
  });
