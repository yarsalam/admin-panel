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
    return value;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <GlobalText className="text-sm opacity-70 mb-2">{title}</GlobalText>
      <div className="flex items-center gap-2">
        <div  className="text-2xl font-bold h-3">
          {formatValue()}
        </div>
        {trend && (
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  );
}
