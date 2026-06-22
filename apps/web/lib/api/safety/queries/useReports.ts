import apiClient from "../../client";

export const fetchReports = (status?: string) =>
  apiClient.get("/safety/reports", { params: { status } }).then((r) => r.data);