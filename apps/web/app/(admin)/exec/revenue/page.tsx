"use client";
import { withPageProtection } from "@/components/withPageProtection";
import {
  useRevenueForecast,
  useAnomalies,
  useStrategicDecisions,
  useLtvBySource,
  useMrr,
  useProductRevenue,
  useGenderRevenue,
  useArppu,
  useCohortRevenue,
  useRevenueFunnel,
  useChurnRevenue,
  useRevenueConcentration,
  useForecastAccuracy,
  type LtvSourceRow,
  type CohortRow,
  type FunnelStep,
  type ProductRevenueRow,
} from "@/lib/api/exec/mutations/useRevenue";
import SectionTitle from "@/components/ui/SectionTitle";
import GlobalText from "@/components/ui/GlobalText";
import { Skeleton } from "@/components/ui/Skeleton";
import KPICard from "@/components/KPICard";
import { Card, MiniStat } from "@/components/ui/shared";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts";

// ─── تایپ‌های محلی ───────────────────────────────────────────────────────────
interface MonthlyPoint {
  month: string;
  amount: number;
  paymentCount: number;
}
interface DailyPoint {
  date: string;
  amount: number;
}

const useMonthlyTrend = () =>
  useQuery<MonthlyPoint[]>({
    queryKey: ["revenue", "monthly"],
    queryFn: () => apiClient.get("/exec/revenue/monthly").then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

const useHistorical = () =>
  useQuery<DailyPoint[]>({
    queryKey: ["revenue", "historical"],
    queryFn: () =>
      apiClient.get("/exec/revenue/historical").then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

// ─── رنگ‌های مشترک ───────────────────────────────────────────────────────────
const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const fmt = (v: number) => v?.toLocaleString() ?? "—";
const fmtM = (v: number) => `${(v / 1_000_000).toFixed(1)}M`;

// ─── کامپوننت‌های پایه ───────────────────────────────────────────────────────

function SectionSkeleton({ h = "h-64" }: { h?: string }) {
  return <Skeleton className={`w-full ${h} rounded-xl`} />;
}

function EmptyState({ text }: { text: string }) {
  return <Card className="p-6 text-center text-sm text-gray-400">{text}</Card>;
}

// ─── ۱. نمودار ماهانه ────────────────────────────────────────────────────────
function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  if (!data?.length) return null;
  return (
    <Card className="p-5">
      <GlobalText as="h3" className="font-bold mb-4">
        درآمد ماهانه (شمسی)
      </GlobalText>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: any) => [`${fmt(Number(v))} تومان`, "درآمد"]}
          />
          <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── ۲. نمودار روزانه ────────────────────────────────────────────────────────
function DailyChart({ data }: { data: DailyPoint[] }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    }),
  }));
  return (
    <Card className="p-5">
      <GlobalText as="h3" className="font-bold mb-4">
        روند روزانه (۹۰ روز)
      </GlobalText>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis
            tickFormatter={(v) => `${(v / 1_000).toFixed(0)}K`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: any) => [`${fmt(Number(v))} تومان`, "درآمد"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#818cf8"
            fill="#818cf833"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── ۳. Forecast ─────────────────────────────────────────────────────────────
function ForecastChart({ data }: { data: any[] }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.revenue,
    low: d.confidence?.[0] ?? d.revenue * 0.85,
    high: d.confidence?.[1] ?? d.revenue * 1.15,
  }));
  return (
    <Card className="p-5">
      <GlobalText as="h3" className="font-bold mb-1">
        پیش‌بینی درآمد ۹۰ روز
      </GlobalText>
      <GlobalText className="text-xs text-gray-500 mb-4">
        خط آبی: مرکزی · سایه: بازه اطمینان
      </GlobalText>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: any, name: string) => {
              const labels: Record<string, string> = {
                revenue: "پیش‌بینی",
                low: "کمترین",
                high: "بیشترین",
              };
              return [`${fmt(Number(v))} تومان`, labels[name] ?? name];
            }}
          />
          <Area
            type="monotone"
            dataKey="high"
            stroke="transparent"
            fill="#6366f122"
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="transparent"
            fill="#ffffff"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

function PeakDaysCard({ peakDays }: { peakDays: string[] }) {
  if (!peakDays?.length) return null;
  return (
    <Card className="p-4">
      <GlobalText as="h3" className="font-bold mb-3">
        📅 روزهای اوج درآمد
      </GlobalText>
      <div className="flex flex-wrap gap-2">
        {peakDays.map((day) => (
          <span
            key={day}
            className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium"
          >
            {new Date(day).toLocaleDateString("fa-IR", {
              month: "long",
              day: "numeric",
            })}
          </span>
        ))}
      </div>
    </Card>
  );
}

function ForecastAlerts({
  alerts,
}: {
  alerts: { type: string; message: string }[];
}) {
  if (!alerts?.length) return null;
  const cfg: Record<string, { color: string; icon: string }> = {
    warning: {
      color: "border-amber-400 bg-amber-50 dark:bg-amber-900/20",
      icon: "⚠️",
    },
    danger: {
      color: "border-red-400 bg-red-50 dark:bg-red-900/20",
      icon: "🔴",
    },
    info: {
      color: "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
      icon: "ℹ️",
    },
  };
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => {
        const c = cfg[a.type] ?? cfg.info;
        return (
          <div
            key={i}
            className={`flex gap-3 items-start border rounded-lg p-3 ${c.color}`}
          >
            <span>{c.icon}</span>
            <GlobalText className="text-sm">{a.message}</GlobalText>
          </div>
        );
      })}
    </div>
  );
}

// ─── ۴. MRR / ARR ────────────────────────────────────────────────────────────
function MrrSection() {
  const { data, isLoading } = useMrr();
  if (isLoading) return <SectionSkeleton h="h-32" />;
  if (!data) return null;
  const mrrTrend = data.mrrGrowth >= 0 ? "up" : "down";
  return (
    <div>
      <SectionTitle>MRR / ARR</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard title="MRR" value={data.mrr} format="currency" />
        <KPICard title="ARR" value={data.arr} format="currency" />
        <KPICard
          title="رشد MRR"
          value={data.mrrGrowth}
          format="percent"
          trend={mrrTrend}
        />
        <MiniStat
          label="ماه‌های ردیابی"
          value={String(data.mrrHistory?.length ?? 0)}
        />
      </div>
      {data.mrrHistory?.length > 0 && (
        <Card className="p-5">
          <GlobalText as="h3" className="font-bold mb-4">
            روند MRR
          </GlobalText>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.mrrHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: any) => [`${fmt(Number(v))} تومان`, "MRR"]}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ─── ۵. درآمد به تفکیک محصول ─────────────────────────────────────────────────
function ProductRevenueSection() {
  const { data, isLoading } = useProductRevenue();
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return null;
  return (
    <div>
      <SectionTitle>درآمد به تفکیک محصول</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ product, share }) =>
                  `${product} ${share?.toFixed(0)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => [`${fmt(Number(v))} تومان`, "درآمد"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    محصول
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    درآمد
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    سهم
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    تراکنش
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((row, i) => (
                  <tr
                    key={row.product}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      {row.product}
                    </td>
                    <td className="px-4 py-2 font-bold text-emerald-600">
                      {fmt(row.revenue)} تومان
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.share?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {fmt(row.transactionCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── ۶. درآمد به تفکیک جنسیت + ARPPU ────────────────────────────────────────
function GenderArppuSection() {
  const { data: gender, isLoading: gLoading } = useGenderRevenue();
  const { data: arppu, isLoading: aLoading } = useArppu();

  if (gLoading || aLoading) return <SectionSkeleton h="h-40" />;
  if (!gender && !arppu) return null;

  const genderRows = gender
    ? [
        { label: "مرد", icon: "👨", ...gender.male },
        { label: "زن", icon: "👩", ...gender.female },
        { label: "نامشخص", icon: "❓", ...gender.unknown },
      ].filter((r) => r.revenue > 0)
    : [];

  return (
    <div>
      <SectionTitle>درآمد به تفکیک جنسیت و ARPPU</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* جنسیت */}
        {genderRows.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      جنسیت
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      درآمد
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      کاربران پرداخت‌کننده
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      ARPPU
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {genderRows.map((r) => (
                    <tr
                      key={r.label}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-2 font-medium">
                        {r.icon} {r.label}
                      </td>
                      <td className="px-4 py-2 font-bold text-emerald-600">
                        {fmt(r.revenue)} تومان
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.payingUsers)}
                      </td>
                      <td className="px-4 py-2 text-indigo-600 font-semibold">
                        {fmt(r.arppu)} تومان
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ARPPU کلی */}
        {arppu && (
          <div className="grid grid-cols-2 gap-4 content-start">
            <KPICard title="ARPPU" value={arppu.arppu} format="currency" />
            <KPICard
              title="نرخ پرداخت‌کننده"
              value={arppu.payingRate}
              format="percent"
            />
            <KPICard
              title="کاربران پرداخت‌کننده"
              value={arppu.payingUsers}
              format="number"
            />
            <KPICard
              title="کاربران فعال"
              value={arppu.activeUsers}
              format="number"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ۷. Cohort Revenue ───────────────────────────────────────────────────────
function CohortSection() {
  const { data, isLoading } = useCohortRevenue();
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return null;

  return (
    <div>
      <SectionTitle>درآمد Cohort</SectionTitle>
      <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
        درآمد کاربران بر اساس ماه جذب — ۳۰، ۶۰، ۹۰ و ۱۸۰ روز بعد
      </GlobalText>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  Cohort
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  کاربران
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  ۳۰ روز
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  ۶۰ روز
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  ۹۰ روز
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  ۱۸۰ روز
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((row: CohortRow) => (
                <tr
                  key={row.cohort}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  <td className="px-4 py-2 font-medium">{row.cohort}</td>
                  <td className="px-4 py-2 text-gray-600">{fmt(row.users)}</td>
                  <td className="px-4 py-2 text-emerald-600">
                    {fmt(row.revenue30d)}
                  </td>
                  <td className="px-4 py-2 text-emerald-700">
                    {fmt(row.revenue60d)}
                  </td>
                  <td className="px-4 py-2 text-emerald-800">
                    {fmt(row.revenue90d)}
                  </td>
                  <td className="px-4 py-2 font-bold text-emerald-900 dark:text-emerald-400">
                    {fmt(row.revenue180d)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── ۸. Conversion Funnel ────────────────────────────────────────────────────
function FunnelSection() {
  const { data, isLoading } = useRevenueFunnel();
  if (isLoading) return <SectionSkeleton h="h-48" />;
  if (!data?.length) return null;

  return (
    <div>
      <SectionTitle>قیف تبدیل درآمد</SectionTitle>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  مرحله
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  کاربران
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  نرخ تبدیل
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  درآمد
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((step: FunnelStep, i: number) => (
                <tr
                  key={step.step}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  <td className="px-4 py-2 font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {step.step}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{fmt(step.users)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-1 max-w-20">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.min(step.conversionRate, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {step.conversionRate?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-bold text-emerald-600">
                    {step.revenue > 0 ? `${fmt(step.revenue)} تومان` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── ۹. Churn Revenue ────────────────────────────────────────────────────────
function ChurnSection() {
  const { data, isLoading } = useChurnRevenue();
  if (isLoading) return <SectionSkeleton h="h-40" />;
  if (!data) return null;

  const nrrColor =
    data.netRevenueRetention >= 100 ? "text-emerald-600" : "text-red-600";

  return (
    <div>
      <SectionTitle>Churn Revenue</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard
          title="درآمد از دست رفته"
          value={data.lostRevenue}
          format="currency"
          trend="down"
        />
        <KPICard
          title="درآمد بازیابی‌شده"
          value={data.recoveredRevenue}
          format="currency"
          trend="up"
        />
        <KPICard
          title="Expansion Revenue"
          value={data.expansionRevenue}
          format="currency"
          trend="up"
        />
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between">
          <span className="text-xs text-gray-500">
            NRR (Net Revenue Retention)
          </span>
          <span className={`text-2xl font-bold mt-2 ${nrrColor}`}>
            {data.netRevenueRetention?.toFixed(1)}%
          </span>
        </div>
      </div>
      {data.history?.length > 0 && (
        <Card className="p-5">
          <GlobalText as="h3" className="font-bold mb-4">
            روند Churn
          </GlobalText>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.history}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${fmt(Number(v))} تومان`]} />
              <Legend />
              <Bar
                dataKey="lost"
                name="از دست رفته"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="recovered"
                name="بازیابی‌شده"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expansion"
                name="Expansion"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ─── ۱۰. Revenue Concentration ───────────────────────────────────────────────
function ConcentrationSection() {
  const { data, isLoading } = useRevenueConcentration();
  if (isLoading) return <SectionSkeleton h="h-36" />;
  if (!data) return null;

  const rows = [
    { label: "Top 1% کاربران", ...data.top1pct },
    { label: "Top 5% کاربران", ...data.top5pct },
    { label: "Top 10% کاربران", ...data.top10pct },
  ];

  return (
    <div>
      <SectionTitle>تمرکز درآمد</SectionTitle>
      <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
        چه درصدی از درآمد از چه درصدی از کاربران می‌آید
      </GlobalText>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((r) => (
              <div
                key={r.label}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs text-gray-500">
                    {fmt(r.users)} کاربر
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-emerald-600">
                    {r.share?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {fmt(r.revenue)} تومان
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 flex flex-col justify-center items-center gap-2">
          <GlobalText className="text-sm text-gray-500">
            ضریب جینی درآمد
          </GlobalText>
          <span className="text-5xl font-bold text-indigo-600">
            {data.giniCoefficient?.toFixed(2)}
          </span>
          <GlobalText className="text-xs text-gray-400 text-center">
            نزدیک ۰: توزیع برابر · نزدیک ۱: تمرکز شدید
          </GlobalText>
        </Card>
      </div>
    </div>
  );
}

// ─── ۱۱. Attribution Table ───────────────────────────────────────────────────
function AttributionSection() {
  const { data, isLoading } = useLtvBySource();
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => (b.ltv ?? 0) - (a.ltv ?? 0));

  return (
    <div>
      <SectionTitle>اقتصاد جذب کاربر به تفکیک منبع</SectionTitle>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                {[
                  "منبع",
                  "کاربران",
                  "درآمد کل",
                  "LTV",
                  "CAC",
                  "LTV/CAC",
                  "دوره بازگشت",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-xs font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sorted.map((row: LtvSourceRow) => {
                const ratio = row.cac > 0 ? row.ltv / row.cac : 0;
                const ratioColor =
                  ratio >= 3
                    ? "text-emerald-600"
                    : ratio >= 1
                      ? "text-amber-600"
                      : "text-red-600";
                return (
                  <tr
                    key={row.source}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2 font-medium">{row.source}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {fmt(row.userCount)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {fmt(row.totalRevenue)} تومان
                    </td>
                    <td className="px-4 py-2 font-bold text-emerald-600">
                      {fmt(row.ltv)} تومان
                    </td>
                    <td className="px-4 py-2 text-rose-600">
                      {fmt(row.cac)} تومان
                    </td>
                    <td className={`px-4 py-2 font-bold ${ratioColor}`}>
                      {ratio > 0 ? `${ratio.toFixed(1)}×` : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.paybackPeriod ? `${row.paybackPeriod} روز` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── ۱۲. Forecast Accuracy ───────────────────────────────────────────────────
function ForecastAccuracySection() {
  const { data, isLoading } = useForecastAccuracy();
  if (isLoading) return <SectionSkeleton h="h-32" />;
  if (!data) return null;

  const mapeColor =
    data.mape <= 10
      ? "text-emerald-600"
      : data.mape <= 20
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div>
      <SectionTitle>دقت مدل پیش‌بینی</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs text-gray-500">MAPE</span>
            <span className={`text-3xl font-bold ${mapeColor}`}>
              {data.mape?.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400">
              خطای میانگین درصدی مطلق
            </span>
          </Card>
          <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs text-gray-500">RMSE</span>
            <span className="text-3xl font-bold text-indigo-600">
              {fmtM(data.rmse)}
            </span>
            <span className="text-xs text-gray-400">
              ریشه میانگین مربعات خطا
            </span>
          </Card>
        </div>
        {data.history?.length > 0 && (
          <Card className="p-5">
            <GlobalText as="h3" className="font-bold mb-4 text-sm">
              واقعی vs پیش‌بینی
            </GlobalText>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.history.slice(-30)}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} hide />
                <YAxis tickFormatter={fmtM} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [`${fmt(Number(v))} تومان`]} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="واقعی"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  name="پیش‌بینی"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Anomaly / Decision cards ─────────────────────────────────────────────────
function AnomalyCard({ anomaly }: { anomaly: any }) {
  const color =
    anomaly.severity === "high"
      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
      : anomaly.severity === "medium"
        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
        : "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  return (
    <div className={`border rounded-lg p-3 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold">{anomaly.date}</span>
          <GlobalText className="text-sm mt-1">
            {anomaly.description}
          </GlobalText>
        </div>
        <div className="text-left shrink-0">
          <div className="text-xs text-gray-500">واقعی</div>
          <div className="text-sm font-bold">
            {anomaly.actual?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            منتظره: {anomaly.expected?.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ decision }: { decision: any }) {
  return (
    <Card className="p-4">
      <GlobalText as="h4" className="font-bold text-sm mb-2">
        {decision.title}
      </GlobalText>
      <GlobalText className="text-xs text-gray-500 mb-2">
        {decision.description}
      </GlobalText>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">تأثیر تخمینی</span>
        <span className="text-sm font-bold text-emerald-600">
          {fmt(decision.impact)} تومان
        </span>
      </div>
      {decision.roi > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">ROI</span>
          <span className="text-sm font-bold text-blue-600">
            {decision.roi}٪
          </span>
        </div>
      )}
    </Card>
  );
}

// ─── صفحه اصلی ───────────────────────────────────────────────────────────────
function RevenuesPage() {
  const { data: monthly, isLoading: mLoading } = useMonthlyTrend();
  const { data: daily, isLoading: dLoading } = useHistorical();
  const { data: anomalies } = useAnomalies();
  const { data: decisions } = useStrategicDecisions();
  const { data: forecast, isLoading: fLoading } = useRevenueForecast(90);

  const totalRevenue = monthly?.reduce((s, m) => s + m.amount, 0) ?? 0;
  const avgMonthly = monthly?.length
    ? Math.round(totalRevenue / monthly.length)
    : 0;
  const totalPayments = monthly?.reduce((s, m) => s + m.paymentCount, 0) ?? 0;
  const lastMonth = monthly?.[monthly.length - 1];
  const growthRate = (forecast as any)?.growthRate;
  const peakDays: string[] = (forecast as any)?.peakDays ?? [];
  const forecastAlerts: any[] = (forecast as any)?.alerts ?? [];
  const forecastPoints: any[] = (forecast as any)?.forecast ?? [];

  return (
    <div className="space-y-10 p-6" dir="rtl">
      {/* هدر */}
      <div>
        <SectionTitle>Executive Revenue Dashboard</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2">
          داده واقعی از جدول payments — فقط تراکنش‌های موفق (paid)
        </GlobalText>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        برخی تحلیل‌های پیشرفتهٔ درآمد (تفکیک محصول و جنسیت، Cohort، قیف درآمد،
        Churn، تمرکز درآمد و دقت پیش‌بینی) هنوز از API فعلی بک‌اند ارائه نمی‌شوند؛
        برای جلوگیری از نمایش دادهٔ ساختگی، تا زمان پیاده‌سازی API مربوطه غیرفعال‌اند.
        نمودارهای ماهانه، تاریخچه، پیش‌بینی موجود، ناهنجاری‌ها و LTV بر اساس APIهای موجود بارگذاری می‌شوند.
      </div>

      {/* ── ۱. KPI اصلی ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {mLoading ? (
          Array(5)
            .fill(null)
            .map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <KPICard
              title="درآمد کل (۱۲ ماه)"
              value={totalRevenue}
              format="currency"
            />
            <KPICard
              title="میانگین ماهانه"
              value={avgMonthly}
              format="currency"
            />
            <KPICard
              title="تعداد پرداخت‌ها"
              value={totalPayments}
              format="number"
            />
            <MiniStat label="آخرین ماه" value={lastMonth?.month ?? "—"} />
            {growthRate !== undefined ? (
              <KPICard
                title="رشد پیش‌بینی‌شده"
                value={growthRate}
                format="percent"
                trend={growthRate >= 0 ? "up" : "down"}
              />
            ) : (
              <Skeleton className="h-24" />
            )}
          </>
        )}
      </div>

      {/* ── ۲. MRR / ARR ── */}
      <MrrSection />

      {/* ── ۳. نمودارهای تاریخی ── */}
      <div>
        <SectionTitle>روند درآمد</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mLoading ? (
            <SectionSkeleton />
          ) : (
            <MonthlyChart data={monthly ?? []} />
          )}
          {dLoading ? <SectionSkeleton /> : <DailyChart data={daily ?? []} />}
        </div>
      </div>

      {/* ── ۴. Forecast ── */}
      <div>
        <SectionTitle>پیش‌بینی درآمد</SectionTitle>
        {fLoading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForecastChart data={forecastPoints} />
            </div>
            <div className="space-y-4">
              <PeakDaysCard peakDays={peakDays} />
              {forecastAlerts.length > 0 && (
                <ForecastAlerts alerts={forecastAlerts} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ۵. محصول ── */}
      <ProductRevenueSection />

      {/* ── ۶. جنسیت + ARPPU ── */}
      <GenderArppuSection />

      {/* ── ۷. Cohort ── */}
      <CohortSection />

      {/* ── ۸. Funnel ── */}
      <FunnelSection />

      {/* ── ۹. Attribution ── */}
      <AttributionSection />

      {/* ── ۱۰. Churn ── */}
      <ChurnSection />

      {/* ── ۱۱. Concentration ── */}
      <ConcentrationSection />

      {/* ── ۱۲. Anomalies ── */}
      {anomalies && anomalies.length > 0 && (
        <div>
          <SectionTitle>ناهنجاری‌های درآمد</SectionTitle>
          <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
            انحراف بیش از ۴۰٪ از میانگین متحرک ۷ روزه
          </GlobalText>
          <div className="space-y-3">
            {anomalies.slice(0, 5).map((a) => (
              <AnomalyCard key={a.id} anomaly={a} />
            ))}
          </div>
        </div>
      )}

      {/* ── ۱۳. Strategic Decisions ── */}
      {decisions && decisions.length > 0 && (
        <div>
          <SectionTitle>پیشنهادات استراتژیک</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decisions.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </div>
        </div>
      )}

      {/* ── ۱۴. Forecast Accuracy ── */}
      <ForecastAccuracySection />
    </div>
  );
}

export default withPageProtection(RevenuesPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
