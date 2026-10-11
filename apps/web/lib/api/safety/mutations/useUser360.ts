import { useMutation } from "@tanstack/react-query";
import apiClient from "../../client";
import toast from "react-hot-toast";

export { fetchUserImages } from "../queries/useUser360";

const reAnalyzeUser = (userId: number, bio: string, messages: string[]) =>
  apiClient
    .post(`/safety/users/${userId}/re-analyze`, { bio, messages })
    .then((r) => r.data);

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
    mutationFn: ({
      userId,
      formData,
    }: {
      userId: number;
      formData: FormData;
    }) => verifyFace(userId, formData),
    onSuccess: () => toast.success("تأیید چهره انجام شد"),
    onError: () => toast.error("خطا در تأیید چهره"),
  });
}
