import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

const base = (id: number) => `/safety/users/${id}`;

// ── Images ────────────────────────────────────────────────────────
export const useApproveImage = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) =>
      apiClient
        .patch(`${base(userId)}/images/${imageId}/approve`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "images"] });
      toast.success("تصویر تأیید شد");
    },
    onError: () => toast.error("خطا در تأیید تصویر"),
  });
};

export const useRejectImage = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, reason }: { imageId: number; reason?: string }) =>
      apiClient
        .patch(`${base(userId)}/images/${imageId}/reject`, { reason })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "images"] });
      toast.success("تصویر رد شد");
    },
    onError: () => toast.error("خطا در رد تصویر"),
  });
};

export const useDeleteImage = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) =>
      apiClient.delete(`${base(userId)}/images/${imageId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "images"] });
      toast.success("تصویر حذف شد");
    },
    onError: () => toast.error("خطا در حذف تصویر"),
  });
};

export const useRequeueImage = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) =>
      apiClient
        .post(`${base(userId)}/images/${imageId}/requeue`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "images"] });
      toast.success("برای پردازش مجدد ارسال شد");
    },
    onError: () => toast.error("خطا"),
  });
};

// ── Trust ─────────────────────────────────────────────────────────
export const useOverrideTrust = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { score: number; reason: string }) =>
      apiClient
        .post(`${base(userId)}/trust/override`, body)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "trust"] });
      qc.invalidateQueries({ queryKey: ["safety", "user360", userId] });
      toast.success("امتیاز اعتماد بروزرسانی شد");
    },
    onError: () => toast.error("خطا در بروزرسانی"),
  });
};

// ── Devices ───────────────────────────────────────────────────────
export const useFlagDevice = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, reason }: { deviceId: string; reason: string }) =>
      apiClient
        .post(`${base(userId)}/devices/${deviceId}/flag`, { reason })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "devices"] });
      toast.success("دستگاه علامت‌گذاری شد");
    },
    onError: () => toast.error("خطا"),
  });
};

export const useRevokeDevice = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) =>
      apiClient.delete(`${base(userId)}/devices/${deviceId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "devices"] });
      toast.success("دسترسی دستگاه لغو شد");
    },
    onError: () => toast.error("خطا"),
  });
};

// ── Phones ────────────────────────────────────────────────────────
export const useBlockPhone = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phoneId: number) =>
      apiClient
        .post(`${base(userId)}/phones/${phoneId}/block`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "phones"] });
      toast.success("شماره مسدود شد");
    },
    onError: () => toast.error("خطا"),
  });
};

// ── Relations ─────────────────────────────────────────────────────
export const useRemoveRelation = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetId: number) =>
      apiClient.delete(`${base(userId)}/relations/${targetId}`),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["safety", "user", userId, "relations"],
      });
      toast.success("رابطه حذف شد");
    },
    onError: () => toast.error("خطا در حذف رابطه"),
  });
};

// ── Notifications ─────────────────────────────────────────────────
export const useSendNotification = (userId: number) =>
  useMutation({
    mutationFn: (body: { title: string; body: string; channels?: string[] }) =>
      apiClient
        .post(`${base(userId)}/notifications/send`, body)
        .then((r) => r.data),
    onSuccess: () => toast.success("نوتیفیکیشن ارسال شد"),
    onError: () => toast.error("خطا در ارسال نوتیفیکیشن"),
  });

// ── Badges ────────────────────────────────────────────────────────
export const useGrantBadge = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; reason?: string }) =>
      apiClient.post(`${base(userId)}/badges`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "badges"] });
      toast.success("Badge اعطا شد");
    },
    onError: () => toast.error("خطا"),
  });
};

export const useRevokeBadge = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: string) =>
      apiClient.delete(`${base(userId)}/badges/${type}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety", "user", userId, "badges"] });
      toast.success("Badge لغو شد");
    },
    onError: () => toast.error("خطا"),
  });
};

// ── Personality ───────────────────────────────────────────────────
export const useUpdatePersonality = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, any>) =>
      apiClient.patch(`${base(userId)}/personality`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["safety", "user", userId, "personality"],
      });
      toast.success("پروفایل شخصیتی بروزرسانی شد");
    },
    onError: () => toast.error("خطا"),
  });
};
