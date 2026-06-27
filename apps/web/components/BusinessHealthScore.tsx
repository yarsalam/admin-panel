"use client";
import GlobalText from "./ui/GlobalText";
import { Skeleton } from "./ui/Skeleton";
import type { BusinessScore } from "@/lib/api/exec/queries/useIntelligence";

interface Props {
  score?: BusinessScore;
  isLoading: boolean;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  revenue: "درآمد",
  retention: "ماندگاری",
  feedback: "بازخورد",
  infrastructure: "زیرساخت",
};

const COLORS: Record<string, string> = {
  revenue: "#00D4AA",
  retention: "#8B5CF6",
  feedback: "#F59E0B",
  infrastructure: "#38BDF8",
};

function scoreColor(total: number) {
  if (total >= 75) return "#00D4AA"; // سبز فیروزه‌ای - سالم
  if (total >= 50) return "#F59E0B"; // زرد - نیاز به توجه
  return "#EF4444"; // قرمز - بحرانی
}

export default function BusinessHealthScore({ score, isLoading }: Props) {
  if (isLoading || !score) {
    return (
      <div className="bg-[#0F1424] rounded-2xl p-6 flex flex-col items-center gap-4">
        <Skeleton className="h-48 w-48 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  const { total, breakdown, trend } = score;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (total / 100) * circumference;
  const color = scoreColor(total);

  return (
    <div className="bg-[#0F1424] rounded-2xl p-6 flex flex-col items-center gap-5 border border-white/5">
      <GlobalText className="text-sm font-bold text-gray-300 tracking-wide">
        امتیاز سلامت کسب‌وکار
      </GlobalText>

      {/* رینگ دایره‌ای */}
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 180 180" className="h-48 w-48 -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#1C2333"
            strokeWidth="12"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s ease, stroke 0.8s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color, fontVariantNumeric: "tabular-nums" }}
          >
            {total}
          </span>
          <span className="text-xs text-gray-400 mt-1">از ۱۰۰</span>
        </div>
      </div>

      {/* روند */}
      <div className="flex items-center gap-1 text-sm">
        {trend.direction === "up" && (
          <span className="text-green-400">↑ {trend.change}</span>
        )}
        {trend.direction === "down" && (
          <span className="text-red-400">↓ {Math.abs(trend.change)}</span>
        )}
        {trend.direction === "stable" && (
          <span className="text-gray-400">پایدار</span>
        )}
        <span className="text-gray-500">نسبت به دوره قبل</span>
      </div>

      {/* تجزیه‌ی درصدی */}
      <div className="w-full space-y-2 mt-2">
        {Object.entries(breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-16 shrink-0">
              {BREAKDOWN_LABELS[key] || key}
            </span>
            <div className="flex-1 h-1.5 bg-[#1C2333] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, val))}%`,
                  backgroundColor: COLORS[key] || "#888",
                }}
              />
            </div>
            <span className="text-xs text-gray-300 tabular-nums w-8 text-left">
              {Math.round(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
