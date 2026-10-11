import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const getBundles = () =>
  apiClient.get("/product/bundles").then((r) => r.data);

export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/product/bundles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      apiClient.patch(`/product/bundles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/product/bundles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
  });
}

// اگر page.tsx مستقیم function می‌خواد (نه hook):
export async function createBundle(data: any) {
  const { data: result } = await apiClient.post("/product/bundles", data);
  return result;
}

export async function updateBundle(id: number, data: any) {
  const { data: result } = await apiClient.patch(
    `/product/bundles/${id}`,
    data,
  );
  return result;
}

export async function deleteBundle(id: number) {
  const { data: result } = await apiClient.delete(`/product/bundles/${id}`);
  return result;
}
