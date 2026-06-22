"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { registerSchema } from "@/schemas/auth";
import { adminRoles } from "@/data/roles";
import { allPermissions, RoleDefaultPermissions } from "@/data/permissions";
import type { z } from "zod";
import { useEffect } from "react"; // فراموش نشود
import FormCard from "@/components/ui/FormCard";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";
import { useRegisterMutation } from "@/lib/api/auth/mutations/useRegisterMutation";
import Link from "next/link";
import GlobalText from "@/components/ui/GlobalText";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterAdminPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", role: "superadmin", permissions: [] },
  });

  const selectedRole = watch("role");

  // هر بار که نقش تغییر کرد، مجوزها را بر اساس پیش‌فرض آن نقش تنظیم کن
  useEffect(() => {
    const defaults = RoleDefaultPermissions[selectedRole] || [];
    setValue("permissions", defaults);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success("ایمیل تنظیم رمز ارسال شد");
      router.push("/admin/users");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "خطا");
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  return (
    <FormCard title="ایجاد ادمین جدید" subtitle="فقط توسط سوپرادمین">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <FormInput
          type="text"
          label="ایمیل"
          placeholder="admin@domain.com"
          control={control}
          name="email"
        />
        <FormInput
          type="dropdown"
          label="نقش"
          control={control}
          name="role"
          dropdownItems={adminRoles}
          searchable
        />
        <FormInput
          type="dropdown"
          label="دسترسی‌ها"
          placeholder="انتخاب کنید"
          control={control}
          name="permissions"
          dropdownItems={allPermissions}
          multiple
          searchable
        />
        <div className="">
          <GlobalText className="hover:underline cursor-pointer">
            اگر ثبت نام کرده اید
            <Link href="/login" className="pr-1 text-red-400 font-bold">
              وارد شوید
            </Link>
          </GlobalText>
        </div>
        <CustomButton
          label="ایجاد ادمین"
          gradient
          loading={registerMutation.isPending}
          className="w-full mt-4"
        />
      </form>
    </FormCard>
  );
}