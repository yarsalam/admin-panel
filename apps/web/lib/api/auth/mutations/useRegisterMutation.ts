import { useMutation } from "@tanstack/react-query";
import { registerAdmin } from "../queries/authQueries";
import toast from "react-hot-toast";


export function useRegisterMutation() {

  return useMutation({
    mutationFn: registerAdmin,
    onSuccess: () => {
      toast.success("ثبتنام با موفقیت انجام شد");
    },
    onError: (err: any) => {
      toast.success("ثبتنام ناموفق");
    },
  });
}