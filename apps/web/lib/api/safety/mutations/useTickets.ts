import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

const resolveTicket = (id: number, resolution: string) =>
  apiClient.post(`/safety/tickets/${id}/resolve`, { resolution }).then((r) => r.data);

const addTicketMessage = (id: number, userId: number, content: string) =>
  apiClient.post(`/safety/tickets/${id}/message`, { userId, content }).then((r) => r.data);

const reAnalyzeTicket = (id: number, content: string, userId: number) =>
  apiClient.post(`/safety/tickets/${id}/re-analyze`, { content, userId }).then((r) => r.data);

export function useResolveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution: string }) =>
      resolveTicket(id, resolution),
    onSuccess: () => {
      toast.success("تیکت با موفقیت بسته شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "tickets"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "خطا"),
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      userId,
      content,
    }: {
      id: number;
      userId: number;
      content: string;
    }) => addTicketMessage(id, userId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["safety", "tickets", variables.id] });
    },
  });
}

export function useReAnalyzeTicket() {
  return useMutation({
    mutationFn: ({
      id,
      content,
      userId,
    }: {
      id: number;
      content: string;
      userId: number;
    }) => reAnalyzeTicket(id, content, userId),
    onSuccess: () => toast.success("تحلیل مجدد انجام شد"),
    onError: () => toast.error("خطا در تحلیل"),
  });
}