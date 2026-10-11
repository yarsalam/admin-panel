import apiClient from "../../client";

export const fetchFlaggedImages = () =>
  apiClient.get("/safety/moderation/images").then((r) => r.data);

export const fetchFlaggedMessages = () =>
  apiClient.get("/safety/moderation/messages").then((r) => r.data);

export const fetchModerationStats = () =>
  apiClient.get("/safety/moderation/stats").then((r) => r.data);