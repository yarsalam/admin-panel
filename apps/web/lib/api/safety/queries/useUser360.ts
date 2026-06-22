import apiClient from "../../client";

export const fetchUserProfile = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/profile`).then(r => r.data);

export const fetchUserImages = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/images`).then(r => r.data);

export const fetchUserActivity = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/activity`).then(r => r.data);

export const fetchUserFinancial = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/financial`).then(r => r.data);

export const fetchUserReports = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/reports`).then(r => r.data);

export const fetchAiAdvice = (userId: number) =>
  apiClient.get(`/safety/users/${userId}/ai-advice`).then(r => r.data);