"use client";
import GlobalText from "./ui/GlobalText";
import { Skeleton } from "./ui/Skeleton";
import type { Recommendation } from "@/lib/api/exec/queries/useIntelligence";

const PRIORITY_STYLE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  critical: { bg: "bg-red-500/15", text: "text-red-400", label: "بحرانی" },
  high: { bg: "bg-amber-500/15", text: "text-amber-400", label: "بالا" },
  medium: { bg: "bg-purple-500/15", text: "text-purple-300", label: "متوسط" },
  low: { bg: "bg-gray-500/15", text: "text-gray-400", label: "پایین" },
};

const DOMAIN_LABEL: Record<string, string> = {
  revenue: "درآمد",
  seo: "سئو",
  users: "کاربران",
  ai: "هوش مصنوعی",
  infrastructure: "زیرساخت",
};

interface Props {
  recommendations?: Recommendation[];
  isLoading: boolean;
}

export default function TopRecommendations({
  recommendations,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-[#0F1424] rounded-2xl p-6 text-center border border-white/5">
        <GlobalText className="text-gray-400">
          در حال حاضر مورد بحرانی‌ای شناسایی نشده — همه چیز در مسیر درست است.
        </GlobalText>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const style = PRIORITY_STYLE[rec.priority] || PRIORITY_STYLE.low;
        return (
          <div
            key={rec.id}
            className="bg-[#0F1424] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {DOMAIN_LABEL[rec.domain] || rec.domain}
                  </span>
                </div>
                <GlobalText className="font-bold text-gray-100">
                  {rec.title}
                </GlobalText>
                <GlobalText className="text-sm text-gray-400 mt-1">
                  {rec.description}
                </GlobalText>
                <div className="mt-2 text-xs text-[#00D4AA]">
                  ↳ {rec.action}
                </div>
              </div>
              {rec.expectedImpact > 0 && (
                <div className="text-left shrink-0">
                  <div className="text-xs text-gray-500">تأثیر تخمینی</div>
                  <div className="text-sm font-bold text-gray-200 tabular-nums">
                    {rec.expectedImpact.toLocaleString()} تومان
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
