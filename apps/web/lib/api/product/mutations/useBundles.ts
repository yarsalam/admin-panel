import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

export const createBundle = (data: any) =>
  apiClient.post("/product/bundles", data).then((r) => r.data);

export const updateBundle = (id: number, data: any) =>
  apiClient.patch(`/product/bundles/${id}`, data).then((r) => r.data);

export const deleteBundle = (id: number) =>
  apiClient.delete(`/product/bundles/${id}`).then((r) => r.data);

export const useCreateBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBundle,
    onSuccess: () => {
      toast.success("باندل جدید ایجاد شد");
      qc.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: () => toast.error("خطا در ایجاد باندل"),
  });
};

export const useUpdateBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateBundle(id, data),
    onSuccess: () => {
      toast.success("باندل با موفقیت ویرایش شد");
      qc.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: () => toast.error("خطا در ویرایش باندل"),
  });
};

export const useDeleteBundle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      toast.success("باندل حذف شد");
      qc.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: () => toast.error("خطا در حذف باندل"),
  });
};
