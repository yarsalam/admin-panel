import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

const approveContent = (type: "image" | "message", id: number) =>
  apiClient.post(`/safety/moderation/approve/${type}/${id}`).then((r) => r.data);

const rejectContent = (type: "image" | "message", id: number) =>
  apiClient.post(`/safety/moderation/reject/${type}/${id}`).then((r) => r.data);

const manualCheck = (text: string, senderId: number, receiverId: number) =>
  apiClient.post("/safety/moderation/check", { text, senderId, receiverId }).then((r) => r.data);

const batchCheck = (items: any[]) =>
  apiClient.post("/safety/moderation/batch-check", items).then((r) => r.data);

const clearModerationCache = () =>
  apiClient.post("/safety/moderation/cache/clear").then((r) => r.data);

export function useApproveContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "image" | "message"; id: number }) =>
      approveContent(type, id),
    onSuccess: () => {
      toast.success("محتوا تأیید شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "moderation"] });
    },
  });
}

export function useRejectContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "image" | "message"; id: number }) =>
      rejectContent(type, id),
    onSuccess: () => {
      toast.success("محتوا رد شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "moderation"] });
    },
  });
}

export function useManualCheck() {
  return useMutation({
    mutationFn: ({
      text,
      senderId,
      receiverId,
    }: {
      text: string;
      senderId: number;
      receiverId: number;
    }) => manualCheck(text, senderId, receiverId),
  });
}

export function useBatchCheck() {
  return useMutation({ mutationFn: batchCheck });
}

export function useClearModerationCache() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearModerationCache,
    onSuccess: () => {
      toast.success("کش مودریشن پاک شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "moderation"] });
    },
  });
}