import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { Skeleton } from "@/components/ui/Skeleton";

const fetchRisk = (userId: number) =>
  apiClient.get(`/safety/risk/${userId}`).then((r) => r.data);

const levelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const actionLabels: Record<string, string> = {
  none: "اقدام لازم نیست",
  monitor: "نظارت مستمر",
  manual_review: "بررسی دستی",
  restrict: "محدود‌سازی",
  ban: "مسدود کردن",
};

export default function RiskPanel({ userId }: { userId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["safety", "risk", userId],
    queryFn: () => fetchRisk(userId),
    enabled: !!userId,
  });

  if (isLoading) return <Skeleton className="h-40" />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Risk Score</p>
          <p
            className={`text-4xl font-bold ${
              data.riskScore > 60
                ? "text-red-600"
                : data.riskScore > 30
                  ? "text-orange-500"
                  : "text-green-600"
            }`}
          >
            {data.riskScore}
          </p>
          <p className="text-xs text-gray-400 mt-1">از ۱۰۰</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Trust Score</p>
          <p className="text-4xl font-bold text-blue-600">{data.trustScore}</p>
          <p className="text-xs text-gray-400 mt-1">از ۱۰۰</p>
        </div>
      </div>

      {/* Level + Action */}
      <div className="flex gap-3 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            levelColors[data.level] ?? "bg-gray-100"
          }`}
        >
          سطح: {data.level}
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700">
          پیشنهاد:{" "}
          {actionLabels[data.recommendedAction] ?? data.recommendedAction}
        </span>
      </div>

      {/* Signals */}
      {data.signals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <p className="font-medium text-sm mb-2 text-red-600">
            سیگنال‌های هشدار
          </p>
          <ul className="space-y-1">
            {data.signals.map((s: string, i: number) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
