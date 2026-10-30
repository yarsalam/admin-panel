import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../queries/authQueries";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginUser,
  });
}
