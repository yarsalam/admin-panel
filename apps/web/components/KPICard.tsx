import GlobalText from "./ui/GlobalText";

interface KPICardProps {
  title: string;
  value: number | string;
  format?: "number" | "currency" | "percent";
  trend?: "up" | "down";
}

export default function KPICard({
  title,
  value,
  format = "number",
  trend,
}: KPICardProps) {
  const formatValue = () => {
    if (format === "currency") return `${Number(value).toLocaleString()} تومان`;
    if (format === "percent") return `${value}%`;
    return Number(value).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <GlobalText className="text-sm opacity-70 mb-2">{title}</GlobalText>
      <div className="flex items-center gap-2">
        {/* رفع باگ: کلاس h-3 قبلاً ارتفاع را محدود می‌کرد و عدد را می‌برید */}
        <div className="text-2xl font-bold leading-tight">{formatValue()}</div>
        {trend && (
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  );
}
