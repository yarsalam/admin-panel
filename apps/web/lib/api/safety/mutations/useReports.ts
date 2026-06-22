import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

const confirmReport = (reportId: number) =>
  apiClient.post(`/safety/reports/${reportId}/confirm`).then((r) => r.data);

const rejectReport = (reportId: number) =>
  apiClient.post(`/safety/reports/${reportId}/reject`).then((r) => r.data);

const blockUserFromReport = (reportId: number, adminId: string) =>
  apiClient.post(`/safety/reports/${reportId}/block`, { adminId }).then((r) => r.data);

const unblockUser = (targetUserId: number) =>
  apiClient.post(`/safety/reports/unblock/${targetUserId}`).then((r) => r.data);

export function useConfirmReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => confirmReport(reportId),
    onSuccess: () => {
      toast.success("گزارش تأیید شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "reports"] });
    },
  });
}

export function useRejectReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => rejectReport(reportId),
    onSuccess: () => {
      toast.success("گزارش رد شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "reports"] });
    },
  });
}

export function useBlockUserFromReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, adminId }: { reportId: number; adminId: string }) =>
      blockUserFromReport(reportId, adminId),
    onSuccess: () => {
      toast.success("کاربر مسدود شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "reports"] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) => unblockUser(targetUserId),
    onSuccess: () => {
      toast.success("کاربر رفع مسدودیت شد");
      queryClient.invalidateQueries({ queryKey: ["safety", "reports"] });
    },
  });
}