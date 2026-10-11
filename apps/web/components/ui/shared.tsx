"use client";

import GlobalText from "@/components/ui/GlobalText";

export function Card({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-900/40">
      <tr className="border-b border-gray-200 dark:border-gray-700">
        {cols.map((c, i) => (
          <th
            key={i}
            className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function SkeletonRows({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function NoData({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center">
        <GlobalText className="text-sm text-gray-400">{msg}</GlobalText>
      </td>
    </tr>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = "bg-blue-500",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card className="p-4">
      <GlobalText className="text-xs text-gray-500 mb-1">{label}</GlobalText>
      <GlobalText className="text-xl font-bold">{String(value)}</GlobalText>
    </Card>
  );
}

export function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export function positionBg(pos: number): string {
  if (pos <= 3)
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (pos <= 10)
    return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (pos <= 20)
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
}

export function threatBg(level?: "high" | "medium" | "low"): string {
  if (level === "high")
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (level === "medium")
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

export function priorityBg(p: string): string {
  if (p === "high")
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (p === "medium")
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
}

export function sourceIcon(s: string): string {
  return (
    (
      { hobby: "🎯", city: "🏙️", value: "💎", search: "🔍" } as Record<
        string,
        string
      >
    )[s] ?? "📝"
  );
}

export function platformIcon(p: string): string {
  return (
    (
      {
        instagram: "📸",
        telegram: "✈️",
        linkedin: "💼",
        google_ads: "🎯",
        medium: "📝",
        other: "🌐",
      } as Record<string, string>
    )[p] ?? "🌐"
  );
}
