"use client";
import GlobalText from "./ui/GlobalText";
import { Skeleton } from "./ui/Skeleton";

interface ServiceHealth {
  name: string;
  status: "up" | "down" | "degraded";
  details?: any;
}

const SERVICE_LABEL: Record<string, string> = {
  ai_verification: "تأیید چهره",
  ai_moderation: "مودریشن",
  ai_image: "تحلیل عکس",
  embedded_ai: "Embedding",
  ai_seo: "سئو هوشمند",
  ai_revenue: "درآمد هوشمند",
  ai_ops: "عملیات",
};

interface Props {
  services?: ServiceHealth[];
  isLoading: boolean;
}

export default function ServiceHealthGrid({ services, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <GlobalText className="text-gray-500 text-sm">
        داده‌ای از سرویس‌ها موجود نیست
      </GlobalText>
    );
  }

  const dotColor: Record<string, string> = {
    up: "bg-[#00D4AA]",
    down: "bg-[#EF4444]",
    degraded: "bg-[#F59E0B]",
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {services.map((svc) => (
        <div
          key={svc.name}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0F1424] border border-white/5"
        >
          <span className="text-sm text-gray-300">
            {SERVICE_LABEL[svc.name] || svc.name}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dotColor[svc.status]}`} />
            <span className="text-xs text-gray-500">
              {svc.status === "up"
                ? "فعال"
                : svc.status === "degraded"
                  ? "ناپایدار"
                  : "قطعی"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
