// apps/web/lib/api/safety/queries/useUser360.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

const base = (id: number) => `/safety/users/${id}`;

// ── Raw fetch functions (برای استفاده مستقیم) ─────────────────────
export const fetchUserProfile = (userId: number) =>
  apiClient.get(`${base(userId)}/profile`).then((r) => r.data);

export const fetchUserImages = (userId: number) =>
  apiClient.get(`${base(userId)}/images`).then((r) => r.data);

export const fetchUserActivity = (userId: number) =>
  apiClient.get(`${base(userId)}/activity`).then((r) => r.data);

export const fetchUserFinancial = (userId: number) =>
  apiClient.get(`${base(userId)}/financial`).then((r) => r.data);

export const fetchUserReports = (userId: number) =>
  apiClient.get(`${base(userId)}/reports`).then((r) => r.data);

export const fetchAiAdvice = (userId: number) =>
  apiClient.get(`${base(userId)}/ai-advice`).then((r) => r.data);

// ── 360 aggregate hook ────────────────────────────────────────────
export const useUser360 = (id: number) =>
  useQuery({
    queryKey: ["safety", "user360", id],
    queryFn: () => apiClient.get(`${base(id)}/360`).then((r) => r.data),
    enabled: !!id,
    staleTime: 30_000,
  });

// ── Individual hooks ──────────────────────────────────────────────
export const useUserProfile = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "profile"],
    queryFn: () => fetchUserProfile(id),
    enabled: !!id,
  });

export const useUserImages = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "images"],
    queryFn: () => fetchUserImages(id),
    enabled: !!id,
  });

export const useUserTrust = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "trust"],
    queryFn: () => apiClient.get(`${base(id)}/trust`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserDevices = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "devices"],
    queryFn: () => apiClient.get(`${base(id)}/devices`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserPhones = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "phones"],
    queryFn: () => apiClient.get(`${base(id)}/phones`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserPersonality = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "personality"],
    queryFn: () => apiClient.get(`${base(id)}/personality`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserBadges = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "badges"],
    queryFn: () => apiClient.get(`${base(id)}/badges`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserRelations = (id: number, type?: string) =>
  useQuery({
    queryKey: ["safety", "user", id, "relations", type],
    queryFn: () =>
      apiClient
        .get(`${base(id)}/relations`, { params: type ? { type } : {} })
        .then((r) => r.data),
    enabled: !!id,
  });

export const useUserMetrics = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "metrics"],
    queryFn: () => apiClient.get(`${base(id)}/metrics`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserNotifications = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "notifications"],
    queryFn: () =>
      apiClient.get(`${base(id)}/notifications`).then((r) => r.data),
    enabled: !!id,
  });

export const useUserActivity = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "activity"],
    queryFn: () => fetchUserActivity(id),
    enabled: !!id,
  });

export const useUserFinancial = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "financial"],
    queryFn: () => fetchUserFinancial(id),
    enabled: !!id,
  });

export const useUserReports = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "reports"],
    queryFn: () => fetchUserReports(id),
    enabled: !!id,
  });

export const useAiAdvice = (id: number) =>
  useQuery({
    queryKey: ["safety", "user", id, "ai-advice"],
    queryFn: () => fetchAiAdvice(id),
    enabled: !!id,
  });
