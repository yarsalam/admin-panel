"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useSetPasswordMutation } from "@/lib/api/auth/mutations/useSetPasswordMutation";
import { useAuth } from "@/app/context/AuthContext";
import FormCard from "@/components/ui/FormCard";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";
import { setPasswordSchema } from "@/schemas/auth";


type Form = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { setToken } = useAuth();
  const setPasswordMutation = useSetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await setPasswordMutation.mutateAsync({
        token: token!,
        password: data.password,
      });
      setToken(res.access_token);
      toast.success("رمز عبور با موفقیت تنظیم شد");
      router.push("/exec/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "خطا در تنظیم رمز",
      );
    }
  };

  if (!token) return <div className="p-8 text-center">لینک نامعتبر</div>;

  return (
    <FormCard title="تنظیم رمز عبور" subtitle="رمز عبور خود را انتخاب کنید">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          type="password"
          name="password"
          control={control}
          label="رمز عبور"
          placeholder="حداقل ۸ کاراکتر"
        />
        <FormInput
          type="password"
          name="confirm"
          control={control}
          label="تکرار رمز عبور"
          placeholder="دوباره وارد کنید"
        />
        <CustomButton
          label="تنظیم رمز"
          gradient
          loading={setPasswordMutation.isPending}
          className="w-full"
        />
      </form>
    </FormCard>
  );
}
