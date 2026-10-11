import { useMutation } from "@tanstack/react-query";
import { setPassword } from "../queries/authQueries";
import toast from "react-hot-toast";

export function useSetPasswordMutation() {
  return useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toast.success("تغییر رمز عبور با موفقیت انجام شد");
    },
    onError: (err: any) => {
      toast.success("خطا در تغییر رمز عبور");
    },
  });
}
