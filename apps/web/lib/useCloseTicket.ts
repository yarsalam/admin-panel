import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api/client";


export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) =>
      apiClient.post(`/safety/tickets/${ticketId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety", "tickets"] });
    },
  });
}
