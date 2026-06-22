"use client";
import { withPageProtection } from "@/components/withPageProtection";
import {
  useDashboardKPIs,
  usePhaseDistribution,
  useAlerts,
  useCompetitorRadar,
} from "@/lib/api/exec/mutations/useDashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import GlobalText from "@/components/ui/GlobalText";
import SectionTitle from "@/components/ui/SectionTitle";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import KPICard from "@/components/KPICard.tsx";

function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: phases, isLoading: phasesLoading } = usePhaseDistribution();
  const { data: alerts } = useAlerts();
  const { data: radar } = useCompetitorRadar();

  if (kpisLoading || phasesLoading) return <Skeleton className="h-96" />;
  if (!kpis) return <ErrorState message="خطا در بارگذاری داشبورد" />;

  return (
    <div className="space-y-8">
      <SectionTitle>خلاصه عملکرد</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="کاربران فعال" value={kpis.totalUsers} format="number" />
        <KPICard
          title="درآمد کل (تومان)"
          value={kpis.totalRevenue}
          format="currency"
        />
        <KPICard
          title="نرخ رشد"
          value={kpis.growthRate}
          format="percent"
          trend="up"
        />
        <KPICard
          title="امتیاز بازخورد"
          value={kpis.feedbackScore}
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">توزیع فاز کاربران</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={phases}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FFBB28" />
                <Cell fill="#FF8042" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">رادار رقابتی</h3>
          {radar ? (
            <ul className="space-y-2">
              {radar.slice(0, 3).map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-red-500">{item.change}</span>
                </li>
              ))}
            </ul>
          ) : (
            <GlobalText>داده‌ای موجود نیست</GlobalText>
          )}
        </div>
      </div>

      <SectionTitle>هشدارهای سیستم</SectionTitle>
      <div className="space-y-2">
        {alerts?.map((alert, i) => (
          <div
            key={i}
            className={`p-3 rounded ${alert.type === "critical" ? "bg-red-100 dark:bg-red-900/20" : "bg-yellow-100 dark:bg-yellow-900/20"}`}
          >
            <GlobalText>{alert.message}</GlobalText>
            <span className="text-xs opacity-70">
              {new Date(alert.timestamp).toLocaleString("fa-IR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withPageProtection(DashboardPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
