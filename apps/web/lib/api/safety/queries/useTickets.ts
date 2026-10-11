import apiClient from "../../client";

export const fetchTickets = (params?: { status?: string; priority?: string }) =>
  apiClient.get("/safety/tickets", { params }).then((r) => r.data);

export const fetchTicketDetail = (id: number) =>
  apiClient.get(`/safety/tickets/${id}`).then((r) => r.data);

export const fetchTicketAiAnalysis = (id: number) =>
  apiClient.get(`/safety/tickets/${id}/ai-analysis`).then((r) => r.data);
