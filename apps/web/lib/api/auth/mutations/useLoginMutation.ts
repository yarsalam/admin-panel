import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../queries/authQueries";
import toast from "react-hot-toast";

export function useLoginMutation() {

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("ورود موفقیت‌آمیز بود");
    },
    onError: (err: any) => {
      toast.success("ورود ناموفق");
    },
  });
}
