import {
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

interface Panel {
  name: string;
  permission: string; // یک مجوز خاص برای دیده شدن کل پنل
  icon: React.ForwardRefExoticComponent<any>;
  items: {
    href: string;
    label: string;
    badge?: number;
    permission: string[]; // 🔁 آرایه‌ای از مجوزهای لازم برای این آیتم
  }[];
}

export const panels: Panel[] = [
  {
    name: "مدیریت ارشد",
    icon: ChartBarIcon,
    permission: "view_executive_panel", // فقط کاربرانی که این مجوز را داشته باشند
    items: [
      {
        href: "/exec/dashboard",
        label: "داشبورد",
        permission: ["view_analytics"],
        badge: 3,
      },
      { href: "/exec/seo", label: "سئو", permission: ["view_analytics"] },
      {
        href: "/exec/system-health",
        label: "سلامت سیستم",
        permission: ["view_analytics"],
      },
      { href: "/exec/revenue", label: "درآمد", permission: ["view_analytics"] },
    ],
  },
  {
    name: "اعتماد و ایمنی",
    icon: ShieldCheckIcon,
    permission: "view_safety_panel",
    items: [
      {
        href: "/safety/tickets",
        label: "تیکت‌ها",
        permission: ["manage_users"],
        badge: 12,
      },
      {
        href: "/safety/users",
        label: "نمای ۳۶۰ کاربر",
        permission: ["manage_users"],
      },
      {
        href: "/safety/moderation",
        label: "بررسی محتوا",
        permission: ["edit_content", "delete_content"],
      },
    ],
  },
  {
    name: "رشد",
    icon: RocketLaunchIcon,
    permission: "view_growth_panel",
    items: [
      {
        href: "/growth/campaigns",
        label: "کمپین‌ها",
        permission: ["edit_content"],
      },
      {
        href: "/growth/seo-studio",
        label: "استودیو سئو",
        permission: ["edit_content"],
      },
      {
        href: "/growth/social",
        label: "شبکه‌های اجتماعی",
        permission: ["edit_content"],
      },
    ],
  },
  {
    name: "محصول",
    icon: BeakerIcon,
    permission: "view_product_panel",
    items: [
      {
        href: "/product/feed-simulator",
        label: "شبیه‌ساز فید",
        permission: ["edit_content", "delete_content"],
      },
      {
        href: "/product/algorithm-tuning",
        label: "تنظیم الگوریتم",
        permission: ["edit_content"],
      },
      {
        href: "/product/bundles",
        label: "باندل‌ها",
        permission: ["delete_content"],
      },
    ],
  },
];
