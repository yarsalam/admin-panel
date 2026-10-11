import { KeywordRanking } from "@/lib/api/exec/mutations/useSeo";
import { Card, ProgressBar } from "../ui/shared";
import GlobalText from "../ui/GlobalText";

function seoHealthScore(keywords: KeywordRanking[]): number {
  if (!keywords.length) return 0;
  const avgPos = keywords.reduce((s, k) => s + k.position, 0) / keywords.length;
  return Math.max(0, Math.min(100, Math.round(100 - avgPos)));
}

function healthColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function healthLabel(score: number): string {
  if (score >= 75) return "سالم";
  if (score >= 50) return "متوسط";
  return "نیاز به بهبود";
}

export function SeoHealthWidget({ keywords }: { keywords: KeywordRanking[] }) {
  const score = seoHealthScore(keywords);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const svgColor =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
              className="dark:stroke-gray-700"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={svgColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${healthColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-gray-400">از ۱۰۰</span>
          </div>
        </div>
        <div className="flex-1">
          <GlobalText as="h3" className="text-lg font-bold mb-1">
            سلامت سئو
          </GlobalText>
          <span
            className={`inline-block text-sm font-medium px-2 py-0.5 rounded ${
              score >= 75
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : score >= 50
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {healthLabel(score)}
          </span>
          <GlobalText className="text-sm text-gray-500 mt-2">
            بر اساس میانگین رتبه {keywords.length} کلمه کلیدی فعال
          </GlobalText>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>کلمات صفحه اول</span>
              <span className="font-medium">
                {keywords.filter((k) => k.position <= 10).length} از{" "}
                {keywords.length}
              </span>
            </div>
            <ProgressBar
              value={keywords.filter((k) => k.position <= 10).length}
              max={Math.max(keywords.length, 1)}
              color="bg-emerald-500"
            />
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>روند صعودی</span>
              <span className="font-medium">
                {keywords.filter((k) => k.trend === "up").length} کلمه
              </span>
            </div>
            <ProgressBar
              value={keywords.filter((k) => k.trend === "up").length}
              max={Math.max(keywords.length, 1)}
              color="bg-blue-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
