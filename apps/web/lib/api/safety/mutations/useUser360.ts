import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

import {
  fetchUserProfile,
  fetchUserImages,
  fetchUserActivity,
  fetchUserFinancial,
  fetchUserReports,
  fetchAiAdvice,
} from "../queries/useUser360";

// Queries
export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "profile"],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUserImages(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "images"],
    queryFn: () => fetchUserImages(userId),
    enabled: !!userId,
  });
}

export function useUserActivity(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "activity"],
    queryFn: () => fetchUserActivity(userId),
    enabled: !!userId,
  });
}

export function useUserFinancial(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "financial"],
    queryFn: () => fetchUserFinancial(userId),
    enabled: !!userId,
  });
}

export function useUserReports(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "reports"],
    queryFn: () => fetchUserReports(userId),
    enabled: !!userId,
  });
}

export function useAiAdvice(userId: number) {
  return useQuery({
    queryKey: ["safety", "users", userId, "ai-advice"],
    queryFn: () => fetchAiAdvice(userId),
    enabled: !!userId,
  });
}

// Mutations
const reAnalyzeUser = (userId: number, bio: string, messages: string[]) =>
  apiClient.post(`/safety/users/${userId}/re-analyze`, { bio, messages }).then((r) => r.data);

const verifyFace = (userId: number, formData: FormData) =>
  apiClient
    .post(`/safety/users/${userId}/verify-face`, formData)
    .then((r) => r.data);

export function useReAnalyzeUser() {
  return useMutation({
    mutationFn: ({
      userId,
      bio,
      messages,
    }: {
      userId: number;
      bio: string;
      messages: string[];
    }) => reAnalyzeUser(userId, bio, messages),
    onSuccess: () => toast.success("تحلیل مجدد انجام شد"),
    onError: () => toast.error("خطا در تحلیل"),
  });
}

export function useVerifyFace() {
  return useMutation({
    mutationFn: ({ userId, formData }: { userId: number; formData: FormData }) =>
      verifyFace(userId, formData),
    onSuccess: () => toast.success("تأیید چهره انجام شد"),
    onError: () => toast.error("خطا در تأیید چهره"),
  });
}