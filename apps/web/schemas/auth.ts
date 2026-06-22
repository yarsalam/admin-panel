import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(8, "حداقل 6 کاراکتر"),
});

export const registerSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(8, "حداقل 6 کاراکتر"),
  role: z.enum(["superadmin", "support", "marketing", "product"], {
    errorMap: () => ({ message: "نقش نامعتبر است" }),
  }),
  permissions: z.array(z.string()).optional(),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "حداقل ۸ کاراکتر"),
    confirm: z.string().min(8, "حداقل ۸ کاراکتر"),
  })
  .refine(
    (data) => data.password === data.confirm,
    "رمز عبور و تکرار آن مطابقت ندارند",
  );

// برای login response
export const authResponseSchema = z.object({
  access_token: z.string(),
});
