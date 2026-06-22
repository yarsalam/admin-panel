// "use client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import toast from "react-hot-toast";
// import { loginSchema } from "@/schemas/auth";
// import type { z } from "zod";
// import { useLoginMutation } from "@/lib/api/auth/mutations/useLoginMutation";
// import { useAuth } from "@/app/context/AuthContext";
// import FormCard from "@/components/ui/FormCard";
// import FormInput from "@/components/ui/FormInput";
// import CustomButton from "@/components/ui/CustomButton";
// import GlobalText from "@/components/ui/GlobalText";
// import Link from "next/link";

// type LoginForm = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const { setToken } = useAuth();
//   const loginMutation = useLoginMutation();

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { email: "", password: "" },
//   });

//   const onSubmit = async (data: LoginForm) => {
//     try {
//       const res = await loginMutation.mutateAsync(data);
//       setToken(res.access_token);
//       toast.success("ورود موفق");
//       // ❌ router.push removed – AuthProvider will handle it
//     } catch (err: any) {
//       const message =
//         err?.response?.data?.message || err?.message || "خطا در ورود";
//       toast.error(message);
//     }
//   };

//   const onError = () => {
//     const firstError = Object.values(errors)[0];
//     if (firstError?.message) toast.error(firstError.message as string);
//   };

//   return (
//     <FormCard
//       title="ورود به پنل مدیریت"
//       subtitle="لطفاً اطلاعات خود را وارد کنید"
//     >
//       <div className="flex justify-center mb-5">
//         <Image
//           src="/logo.png"
//           alt="Yarsalam"
//           width={80}
//           height={80}
//           className="rounded-full bg-cyan-300 dark:bg-blue-900 p-2"
//         />
//       </div>
//       <form onSubmit={handleSubmit(onSubmit, onError)}>
//         <FormInput
//           type="text"
//           label="ایمیل"
//           placeholder="admin@example.com"
//           control={control}
//           name="email"
//         />
//         <FormInput
//           type="password"
//           label="رمز عبور"
//           placeholder="••••••••"
//           control={control}
//           name="password"
//           className="!mb-1"
//         />
//         <div className="flex justify-between mb-2">
//           <Link href="/register">
//             <GlobalText className="hover:underline cursor-pointer">
//               ثبت نام
//             </GlobalText>
//           </Link>
//           <Link href="/set-password">
//             <GlobalText className="hover:underline cursor-pointer">
//               فراموشی رمز عبور
//             </GlobalText>
//           </Link>
//         </div>
//         <CustomButton
//           label="ورود"
//           gradient
//           loading={loginMutation.isPending}
//           className="w-full mt-6"
//         />
//       </form>
//     </FormCard>
//   );
// }
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { loginSchema } from "@/schemas/auth";
import type { z } from "zod";
import { useLoginMutation } from "@/lib/api/auth/mutations/useLoginMutation";
import { useAuth } from "@/app/context/AuthContext";
import { panels } from "@/data/panels"; // داده‌های پنل‌ها
import FormCard from "@/components/ui/FormCard";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";
import GlobalText from "@/components/ui/GlobalText";
import Link from "next/link";

type LoginForm = z.infer<typeof loginSchema>;

// تابع کمکی برای پیدا کردن اولین آیتم مجاز
function getFirstAllowedPath(permissions: string[]): string {
  for (const panel of panels) {
    // اگر کاربر مجوز دیدن کل پنل را داشته باشد
    if (permissions.includes(panel.permission)) {
      // اولین زیرمنوی مجاز در آن پنل را پیدا کن
      for (const item of panel.items) {
        if (
          Array.isArray(item.permission)
            ? item.permission.some((p) => permissions.includes(p))
            : permissions.includes(item.permission)
        ) {
          return item.href; // اولین مسیر قابل دسترسی
        }
      }
    }
  }
  return "/unauthorized"; // در صورتی که هیچ چیز پیدا نشد (نباید پیش بیاید)
}

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await loginMutation.mutateAsync(data);

      // ابتدا توکن را تنظیم کن تا user در context به‌روز شود
      setToken(res.access_token);

      // از توکن decode شده یا از پاسخ سرور permissionها را بگیر
      // (در اینجا مستقیماً از توکن استفاده می‌کنیم چون setToken آن را ذخیره کرده)
      const tokenPayload = JSON.parse(atob(res.access_token.split(".")[1]));
      const permissions: string[] = tokenPayload.permissions || [];

      // پیدا کردن مسیر مجاز
      const redirectTo = getFirstAllowedPath(permissions);
      console.log("redirectTo", redirectTo);
      toast.success("ورود موفق");
      router.push(redirectTo);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "خطا در ورود";
      toast.error(message);
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  return (
    <FormCard
      title="ورود به پنل مدیریت"
      subtitle="لطفاً اطلاعات خود را وارد کنید"
    >
      <div className="flex justify-center mb-5">
        <Image
          src="/logo.png"
          alt="Yarsalam"
          width={80}
          height={80}
          className="rounded-full bg-cyan-300 dark:bg-blue-900 p-2"
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <FormInput
          type="text"
          label="ایمیل"
          placeholder="admin@example.com"
          control={control}
          name="email"
        />
        <FormInput
          type="password"
          label="رمز عبور"
          placeholder="••••••••"
          control={control}
          name="password"
          className="!mb-1"
        />
        <div className="flex justify-between mb-2">
          <Link href="/register">
            <GlobalText className="hover:underline cursor-pointer">
              ثبت نام
            </GlobalText>
          </Link>
          <Link href="/set-password">
            <GlobalText className="hover:underline cursor-pointer">
              فراموشی رمز عبور
            </GlobalText>
          </Link>
        </div>
        <CustomButton
          label="ورود"
          gradient
          loading={loginMutation.isPending}
          className="w-full mt-6"
        />
      </form>
    </FormCard>
  );
}
