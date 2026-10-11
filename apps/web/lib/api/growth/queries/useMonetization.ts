import apiClient from "@/lib/api/client";

export const fetchFeedbackCount = () =>
  apiClient.get("/growth/monetization/feedback-count").then((r) => r.data);
