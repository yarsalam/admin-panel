// data/permissions.ts
export const allPermissions = [
  { label: "مدیریت کاربران", value: "manage_users" },
  { label: "ویرایش محتوا", value: "edit_content" },
  { label: "حذف محتوا", value: "delete_content" },
  { label: "مشاهده آمار", value: "view_analytics" },
  { label: "پنل مدیریت ارشد", value: "view_executive_panel" },
  { label: "پنل اعتماد و ایمنی", value: "view_safety_panel" },
  { label: "پنل رشد", value: "view_growth_panel" },
  { label: "پنل محصول", value: "view_product_panel" },
  { label: "مدیریت کمپین‌های ریفرال", value: "manage_referral_campaigns" },
] as const;

export const RoleDefaultPermissions: Record<string, string[]> = {
  superadmin: allPermissions.map((p) => p.value), // سوپرادمین همه چیز دارد
  support: ["manage_users", "view_analytics", "view_safety_panel"],
  marketing: ["edit_content", "view_analytics", "view_growth_panel"],
  product: ["edit_content", "delete_content", "view_product_panel"],
};
