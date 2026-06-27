"use client";
import { withPageProtection } from "@/components/withPageProtection";
import {
  useDashboardKPIs,
  usePhaseDistribution,
  useAlerts,
  useCompetitorRadar,
} from "@/lib/api/exec/queries/useDashboard";
import {
  useBusinessScore,
  useTopRecommendations,
} from "@/lib/api/exec/queries/useIntelligence";
import { useServicesHealth } from "@/lib/api/exec/mutations/useSystemHealth";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import GlobalText from "@/components/ui/GlobalText";
import SectionTitle from "@/components/ui/SectionTitle";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import KPICard from "@/components/KPICard";
import BusinessHealthScore from "@/components/BusinessHealthScore";
import TopRecommendations from "@/components/TopRecommendations";
import ServiceHealthGrid from "@/components/ServiceHealthGrid";

const PHASE_COLORS = ["#00D4AA", "#F59E0B", "#8B5CF6"];

function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: phases } = usePhaseDistribution();
  const { data: alerts } = useAlerts();
  const { data: radar } = useCompetitorRadar();

  const { data: score, isLoading: scoreLoading } = useBusinessScore();
  const { data: recommendations, isLoading: recLoading } =
    useTopRecommendations();
  const { data: services, isLoading: servicesLoading } = useServicesHealth();

  if (kpisLoading) return <Skeleton className="h-96" />;
  if (!kpis) return <ErrorState message="خطا در بارگذاری داشبورد" />;

  return (
    <div className="space-y-8">
      <SectionTitle>مرکز فرماندهی</SectionTitle>

      {/* ===== سه‌ستونی اصلی ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-6">
        {/* ستون چپ: امتیاز سلامت + سرویس‌ها */}
        <div className="space-y-6">
          <BusinessHealthScore score={score} isLoading={scoreLoading} />
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-sm font-bold mb-3 opacity-70">
              وضعیت سرویس‌ها
            </h3>
            <ServiceHealthGrid
              services={services}
              isLoading={servicesLoading}
            />
          </div>
        </div>

        {/* ستون وسط: توصیه‌های برتر */}
        <div>
          <h3 className="text-sm font-bold mb-3 opacity-70">
            مهم‌ترین اقدامات پیشنهادی
          </h3>
          <TopRecommendations
            recommendations={recommendations}
            isLoading={recLoading}
          />
        </div>

        {/* ستون راست: هشدارها + فعالیت اخیر */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold mb-3 opacity-70">هشدارهای فعال</h3>
          {(!alerts || alerts.length === 0) && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
              <GlobalText className="text-sm opacity-60">
                هشدار فعالی وجود ندارد
              </GlobalText>
            </div>
          )}
          {alerts?.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl shadow ${
                alert.type === "critical"
                  ? "bg-red-100 dark:bg-red-900/20"
                  : "bg-yellow-100 dark:bg-yellow-900/20"
              }`}
            >
              <GlobalText className="text-sm">{alert.message}</GlobalText>
              <span className="text-xs opacity-70">
                {new Date(alert.timestamp).toLocaleString("fa-IR")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== KPIهای کلیدی ===== */}
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

      {/* ===== توزیع فاز + رادار رقابتی ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">توزیع فاز کاربران</h3>
          {phases && phases.length > 0 ? (
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
                  {phases.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PHASE_COLORS[i % PHASE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-60" />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">رادار رقابتی</h3>
          {radar && radar.length > 0 ? (
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
    </div>
  );
}

export default withPageProtection(DashboardPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
