import apiClient from "../../client";
import type { z } from "zod";
import { registerSchema, loginSchema, authResponseSchema } from "@/schemas/auth";

// نوع داده‌ها
type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

// تابع ثبت‌نام ادمین
export const registerAdmin = async (data: RegisterForm) => {
  const response = await apiClient.post("/admin/users", data);
  return response.data;
};

// تابع تنظیم رمز عبور
export const setPassword = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const response = await apiClient.post("/admin/auth/setup-password", {
    token,
    password,
  });
  return response.data; // { access_token }
};

// تابع ورود
export const loginUser = async (data: LoginForm) => {
  const response = await apiClient.post("/admin/auth/login", data);
  // اعتبارسنجی پاسخ با Zod برای اطمینان از ساختار
  return authResponseSchema.parse(response.data);
};