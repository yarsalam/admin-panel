"use client";
import { useState } from "react";
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
  type ForecastPoint,
  type ForecastAlert,
  type Anomaly,
  type StrategicDecision,
  type FunnelStep,
  type ProductRevenueRow,
  type RevenueCurrency,
} from "@/lib/api/exec/mutations/useRevenue";
import SectionTitle from "@/components/ui/SectionTitle";
import GlobalText from "@/components/ui/GlobalText";
import { Skeleton } from "@/components/ui/Skeleton";
import KPICard from "@/components/KPICard";
import { Card, MiniStat } from "@/components/ui/shared";
import AcquisitionGrowthSection from "@/components/revenue/AcquisitionGrowthSection";
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

const useMonthlyTrend = (currency: RevenueCurrency) =>
  useQuery<MonthlyPoint[]>({
    queryKey: ["revenue", "monthly", currency],
    queryFn: () => apiClient.get(`/exec/revenue/monthly?currency=${currency}`).then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

const useHistorical = (currency: RevenueCurrency) =>
  useQuery<DailyPoint[]>({
    queryKey: ["revenue", "historical", currency],
    queryFn: () =>
      apiClient.get(`/exec/revenue/historical?currency=${currency}`).then((r) => r.data),
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
const fmtMoney = (v: number | null | undefined, currency: RevenueCurrency) => {
  if (v == null || !Number.isFinite(v)) return "—";
  if (currency === "IRT") return `${Math.round(v / 10).toLocaleString("fa-IR")} تومان`;
  if (currency === "USDT") return `${(v / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
  if (currency === "BTC") return `${(v / 100_000_000).toFixed(8)} BTC`;
  return `${Math.round(v).toLocaleString("en-US")} واحد خام USD (واحد پایه تأیید نشده)`;
};
const displayAmount = (v: number | null | undefined, currency: RevenueCurrency) => {
  if (v == null || !Number.isFinite(v)) return 0;
  if (currency === "IRT") return v / 10;
  if (currency === "USDT") return v / 100;
  if (currency === "BTC") return v / 100_000_000;
  return v;
};
const currencyLabel = (currency: RevenueCurrency) => {
  if (currency === "IRT") return "تومان";
  if (currency === "USDT") return "USDT";
  if (currency === "BTC") return "BTC";
  return "واحد خام USD";
};
const fmtAxis = (v: number, currency: RevenueCurrency) => {
  if (currency === "IRT") return `${(v / 10 / 1_000_000).toFixed(1)}M`;
  if (currency === "USDT") return `${(v / 100 / 1_000_000).toFixed(1)}M`;
  if (currency === "BTC") return `${(v / 100_000_000 / 1_000_000).toFixed(3)}M`;
  return `${(v / 1_000_000).toFixed(1)}M raw`;
};

// ─── کامپوننت‌های پایه ───────────────────────────────────────────────────────

function SectionSkeleton({ h = "h-64" }: { h?: string }) {
  return <Skeleton className={`w-full ${h} rounded-xl`} />;
}

function EmptyState({ text }: { text: string }) {
  return <Card className="p-6 text-center text-sm text-gray-400">{text}</Card>;
}

// ─── ۱. نمودار ماهانه ────────────────────────────────────────────────────────
function MonthlyChart({ data, currency }: { data: MonthlyPoint[]; currency: RevenueCurrency }) {
  if (!data?.length) return null;
  return (
    <Card className="p-5">
      <GlobalText as="h3" className="font-bold mb-4">
        واریزی به کیف پول — ماهانه (شمسی)
      </GlobalText>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmtAxis(v, currency)} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: unknown) => <span>{fmtMoney(Number(v), currency)}</span>}
          />
          <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── ۲. نمودار روزانه ────────────────────────────────────────────────────────
function DailyChart({ data, currency }: { data: DailyPoint[]; currency: RevenueCurrency }) {
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
        روند واریزی به کیف پول (۹۰ روز)
      </GlobalText>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis
            tickFormatter={(v) => fmtAxis(v, currency)}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: unknown) => <span>{fmtMoney(Number(v), "IRT")}</span>}
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
function ForecastChart({ data, currency }: { data: ForecastPoint[]; currency: RevenueCurrency }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.revenue,
    low: d.confidence?.[0] ?? null,
    high: d.confidence?.[1] ?? null,
  }));
  const hasConfidenceBand = chartData.some(
    (point) => point.low !== null && point.high !== null,
  );
  return (
    <Card className="p-5">
      <GlobalText as="h3" className="font-bold mb-1">
        پیش‌بینی واریزی کیف پول — ۹۰ روز
      </GlobalText>
      <GlobalText className="text-xs text-gray-500 mb-4">
        خط آبی: پیش‌بینی واریزی · {hasConfidenceBand ? "سایه: بازه عدم‌قطعیت مدل" : "بازه اطمینان معتبر ارائه نشده است"}
      </GlobalText>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={(v) => fmtAxis(v, currency)} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: unknown, name: unknown) => {
              const labels: Record<string, string> = {
                revenue: "پیش‌بینی",
                low: "کمترین",
                high: "بیشترین",
              };
              return <span>{`${labels[String(name)] ?? String(name)}: ${fmtMoney(Number(v), currency)}`}</span>;
            }}
          />
          {hasConfidenceBand && (
            <>
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
            </>
          )}
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
        const c = cfg[a.type] ?? cfg.info!;
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
function MrrSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useMrr(currency);
  if (isLoading) return <SectionSkeleton h="h-32" />;
  if (!data) return null;

  if (!data.recurringRevenueAvailable) {
    return (
      <div>
        <SectionTitle>درآمد اشتراکی و VIP</SectionTitle>
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MiniStat label="واریزی شارژ کیف پول — ۳۰ روز" value={fmtMoney(data.walletDeposits30d ?? data.grossRevenue30d, currency)} />
            <MiniStat label="برداشت برای checkout — ۳۰ روز" value={fmtMoney(data.walletDebits30d ?? 0, "IRT")} />
            <MiniStat label="فروش تکمیل‌شده — ۳۰ روز" value={fmtMoney(data.grossSales30d ?? 0, "IRT")} />
            <MiniStat label="VIP فعال" value={fmt(data.activeVipUsers)} />
          </div>
          <GlobalText className="text-xs text-gray-500">
            فروش تکمیل‌شده از رخدادهای خریدی محاسبه می‌شود که پس از اعطای موفق بسته ثبت شده‌اند؛ سابقه‌های قدیمی فاقد مبلغ در این شاخص backfill نمی‌شوند.
          </GlobalText>
          <GlobalText className="text-xs text-amber-700 dark:text-amber-400">
            MRR و ARR فعلاً قابل محاسبه معتبر نیستند: پرداخت‌های ثبت‌شده شارژ کیف پول‌اند و خرید بسته بعداً از موجودی کیف پول انجام می‌شود. واریزی، خرید واقعی و تعداد VIP فعال جداگانه گزارش می‌شوند؛ مبلغ تکرارشونده حدس زده نمی‌شود.
          </GlobalText>
        </Card>
      </div>
    );
  }

  const mrrTrend = (data.mrrGrowth ?? 0) >= 0 ? "up" : "down";
  return (
    <div>
      <SectionTitle>MRR / ARR</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard title="MRR" value={displayAmount(data.mrr, currency)} format="currency" currencyLabel={currencyLabel(currency)} />
        <KPICard title="ARR" value={displayAmount(data.arr, currency)} format="currency" currencyLabel={currencyLabel(currency)} />
        <KPICard title="رشد MRR" value={data.mrrGrowth ?? 0} format="percent" trend={mrrTrend} />
        <MiniStat label="ماه‌های ردیابی" value={String(data.mrrHistory?.length ?? 0)} />
      </div>
    </div>
  );
}

// ─── ۵. فروش واقعی بسته‌ها از کیف پول ─────────────────────────────────────────────────
function ProductRevenueSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useProductRevenue(currency);
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return <EmptyState text="در بازه انتخاب‌شده خرید بسته‌ای ثبت نشده است." />;
  return (
    <div>
      <SectionTitle>برداشت checkout و فروش تکمیل‌شده به تفکیک بسته</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <GlobalText as="h3" className="font-bold mb-2">فروش تکمیل‌شده به تفکیک بسته</GlobalText>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="fulfilledRevenue"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: unknown) => <span>{fmtMoney(Number(v), "IRT")}</span>}
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
                    برداشت checkout (تومان)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    فروش تکمیل‌شده (تومان)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    سهم
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    برداشت‌ها
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    خریدهای تکمیل‌شده
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((row: ProductRevenueRow, i: number) => (
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
                      {fmtMoney(row.revenue, "IRT")}
                    </td>
                    <td className="px-4 py-2 font-semibold text-indigo-600">
                      {fmtMoney(row.fulfilledRevenue ?? 0, "IRT")}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.share?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {fmt(row.transactionCount)}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {fmt(row.fulfilledPurchaseCount ?? 0)}
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
function GenderArppuSection({ currency }: { currency: RevenueCurrency }) {
  const { data: gender, isLoading: gLoading } = useGenderRevenue(currency);
  const { data: arppu, isLoading: aLoading } = useArppu(currency);

  if (gLoading || aLoading) return <SectionSkeleton h="h-40" />;
  if (!gender && !arppu) return null;

  const genderRows = gender
    ? [
        { label: "مرد", icon: "👨", ...gender.male },
        { label: "زن", icon: "👩", ...gender.female },
        { label: "نامشخص", icon: "❓", ...gender.unknown },
      ].filter((r) =>
        r.revenue > 0 || (r.fulfilledRevenue ?? 0) > 0 || r.depositRevenue > 0
      )
    : [];

  return (
    <div>
      <SectionTitle>برداشت checkout و فروش تکمیل‌شده به تفکیک جنسیت</SectionTitle>
      <GlobalText className="text-xs text-gray-500 -mt-2 mb-3">
        برداشت checkout و شارژ کیف پول بر اساس جنسیت فعلی پروفایل در زمان گزارش گروه‌بندی می‌شوند؛ اما فروش تکمیل‌شده خریدهای جدید از snapshot جنسیت زمان خرید استفاده می‌کند. پوشش snapshot: {gender?.fulfilledPurchaseSnapshotCoveragePercent == null ? "نامشخص" : `${gender.fulfilledPurchaseSnapshotCoveragePercent.toLocaleString("fa-IR")}٪`}؛ تعداد خریدهای قدیمی با fallback جنسیت فعلی: {fmt(gender?.fulfilledPurchaseLegacyGenderFallbackCount ?? 0)}. مبالغ خرید IRT و به تومان نمایش داده می‌شوند؛ واریز کیف پول در ارز انتخاب‌شده جداست. ARPPU بازه {arppu?.periodDays ?? 30} روزه دارد.
      </GlobalText>
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
                      مبلغ برداشت checkout (تومان)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      شارژ کیف پول ({currency})
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      تعداد شارژ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      فروش تکمیل‌شده (تومان)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      خریداران با اعطای موفق
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      کاربران checkout
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      تعداد برداشت checkout
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      تعداد خرید تکمیل‌شده
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      میانگین برداشت checkout (تومان)
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
                        {fmtMoney(r.revenue, "IRT")}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmtMoney(r.depositRevenue, currency)}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.depositCount)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-indigo-600">
                        {fmtMoney(r.fulfilledRevenue ?? 0, "IRT")}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.fulfilledPayingUsers ?? 0)}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.payingUsers)}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.paymentCount)}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {fmt(r.fulfilledPurchaseCount ?? 0)}
                      </td>
                      <td className="px-4 py-2 text-indigo-600 font-semibold">
                        {fmtMoney(r.arppu, "IRT")}
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
            <KPICard title="ARPPU برداشت کیف پول" value={displayAmount(arppu.arppu, "IRT")} format="currency" currencyLabel={currencyLabel("IRT")} />
            <MiniStat
              label="ARPPU خرید تکمیل‌شده"
              value={arppu.fulfilledArppu == null ? "—" : fmtMoney(arppu.fulfilledArppu, "IRT")}
            />
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
function CohortSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useCohortRevenue(currency);
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return null;

  return (
    <div>
      <SectionTitle>درآمد Cohort</SectionTitle>
      <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
        مجموع خرید واقعی کاربران بر اساس ماه جذب — ۳۰، ۶۰، ۹۰ و ۱۸۰ روز بعد
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
                    {fmtMoney(row.revenue30d, "IRT")}
                  </td>
                  <td className="px-4 py-2 text-emerald-700">
                    {fmtMoney(row.revenue60d, "IRT")}
                  </td>
                  <td className="px-4 py-2 text-emerald-800">
                    {fmtMoney(row.revenue90d, "IRT")}
                  </td>
                  <td className="px-4 py-2 font-bold text-emerald-900 dark:text-emerald-400">
                    {fmtMoney(row.revenue180d, "IRT")}
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
function FunnelSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useRevenueFunnel(currency);
  if (isLoading) return <SectionSkeleton h="h-48" />;
  if (!data?.length) return null;

  return (
    <div>
      <SectionTitle>قیف تبدیل تا برداشت checkout برای خرید بسته</SectionTitle>
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
                    {step.revenue > 0 ? fmtMoney(step.revenue, "IRT") : "—"}
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
function ChurnSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useChurnRevenue();
  if (isLoading) return <SectionSkeleton h="h-40" />;
  if (!data) return null;

  if (!data.revenueMetricsAvailable) {
    return (
      <div>
        <SectionTitle>وضعیت تمدید و انقضای VIP</SectionTitle>
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniStat label="VIP فعال" value={fmt(data.activeVipUsers ?? 0)} />
            <MiniStat label="VIP منقضی‌شده در ۳۰ روز" value={fmt(data.recentlyExpiredVipUsers ?? 0)} />
            <MiniStat label="کاربران با سابقه VIP" value={fmt(data.usersWithVipHistory ?? 0)} />
          </div>
          <GlobalText className="text-xs text-amber-700 dark:text-amber-400">
            درآمد ازدست‌رفته و NRR تا زمان اتصال هر دوره VIP به پرداخت اصلی، مبلغ، ارز و تمدید واقعی قابل محاسبه نیستند. نرخ انقضا در این بخش تعداد کاربران را نشان می‌دهد، نه مبلغ درآمد.
          </GlobalText>
        </Card>
      </div>
    );
  }
  const nrrColor =
    (data.netRevenueRetention ?? 0) >= 100 ? "text-emerald-600" : "text-red-600";

  return (
    <div>
      <SectionTitle>Churn Revenue</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KPICard title="درآمد از دست رفته" value={displayAmount(data.lostRevenue, currency)} format="currency" currencyLabel={currencyLabel(currency)} trend="down" />
        <KPICard title="درآمد بازیابی‌شده" value={displayAmount(data.recoveredRevenue, currency)} format="currency" currencyLabel={currencyLabel(currency)} trend="up" />
        <KPICard title="Expansion Revenue" value={displayAmount(data.expansionRevenue, currency)} format="currency" currencyLabel={currencyLabel(currency)} trend="up" />
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between">
          <span className="text-xs text-gray-500">NRR (Net Revenue Retention)</span>
          <span className={`text-2xl font-bold mt-2 ${nrrColor}`}>{data.netRevenueRetention?.toFixed(1)}%</span>
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
              <YAxis tickFormatter={(v) => fmtAxis(v, currency)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: unknown) => <span>{fmtMoney(Number(v), currency)}</span>} />
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
function ConcentrationSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useRevenueConcentration(currency);
  if (isLoading) return <SectionSkeleton h="h-36" />;
  if (!data) return null;

  const rows = [
    { label: "Top 1% کاربران", ...data.top1pct },
    { label: "Top 5% کاربران", ...data.top5pct },
    { label: "Top 10% کاربران", ...data.top10pct },
  ];

  return (
    <div>
      <SectionTitle>تمرکز مبلغ برداشت checkout برای بسته‌ها</SectionTitle>
      <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
        چه سهمی از خریدهای واقعی از چه سهمی از خریداران می‌آید
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
                    {fmtMoney(r.revenue, "IRT")}
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
function AttributionSection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useLtvBySource(currency);
  if (isLoading) return <SectionSkeleton />;
  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => (b.ltv ?? 0) - (a.ltv ?? 0));

  return (
    <div>
      <SectionTitle>واریزی کیف پول به تفکیک منبع جذب (نه فروش نهایی محصول)</SectionTitle>
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
                const ratio = row.cac !== null && row.cac > 0 ? row.ltv / row.cac : 0;
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
                      {fmtMoney(row.totalRevenue, currency)}
                    </td>
                    <td className="px-4 py-2 font-bold text-emerald-600">
                      {fmtMoney(row.ltv, currency)}
                    </td>
                    <td className="px-4 py-2 text-rose-600">
                      {row.cac === null ? "ثبت نشده" : fmtMoney(row.cac, currency)}
                    </td>
                    <td className={`px-4 py-2 font-bold ${ratioColor}`}>
                      {ratio > 0 ? `${ratio.toFixed(1)}×` : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.paybackPeriod != null ? `${row.paybackPeriod} روز` : "—"}
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
function ForecastAccuracySection({ currency }: { currency: RevenueCurrency }) {
  const { data, isLoading } = useForecastAccuracy(currency);
  if (isLoading) return <SectionSkeleton h="h-32" />;
  if (!data) return null;

  if (!data.dataAvailable || data.mape === null || data.rmse === null) {
    return (
      <div>
        <SectionTitle>دقت پیش‌بینی واریزی کیف پول</SectionTitle>
        <Card className="p-4">
          <GlobalText className="text-sm text-amber-700 dark:text-amber-400">
            {data.reason ?? "برای محاسبه دقت، داده تاریخی کافی در دسترس نیست."}
          </GlobalText>
          <GlobalText className="text-xs text-gray-500 mt-2">
            روش ارزیابی: {data.evaluationMethod ?? "آزمون بازگشتی میانگین متحرک ۷ روزه"}
          </GlobalText>
        </Card>
      </div>
    );
  }
  const mapeColor =
    data.mape <= 10
      ? "text-emerald-600"
      : data.mape <= 20
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div>
      <SectionTitle>دقت پیش‌بینی واریزی کیف پول</SectionTitle>
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
              {fmtAxis(data.rmse, currency)}
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
                <YAxis tickFormatter={(v) => fmtAxis(v, currency)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: unknown) => <span>{fmtMoney(Number(v), currency)}</span>} />
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
function AnomalyCard({ anomaly, currency }: { anomaly: Anomaly; currency: RevenueCurrency }) {
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
            {fmtMoney(anomaly.actual, currency)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            منتظره: {fmtMoney(anomaly.expected, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ decision, currency }: { decision: StrategicDecision; currency: RevenueCurrency }) {
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
          {fmtMoney(decision.impact, currency)}
        </span>
      </div>
      {Number.isFinite(decision.roi) && decision.roi > 0 && (
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
  const [currency, setCurrency] = useState<RevenueCurrency>("IRT");
  const { data: monthly, isLoading: mLoading } = useMonthlyTrend(currency);
  const { data: daily, isLoading: dLoading } = useHistorical(currency);
  const { data: anomalies } = useAnomalies(currency);
  const { data: decisions } = useStrategicDecisions(currency);
  const { data: forecast, isLoading: fLoading } = useRevenueForecast(90, currency);

  const totalRevenue = monthly?.reduce((s, m) => s + m.amount, 0) ?? 0;
  const avgMonthly = monthly?.length
    ? Math.round(totalRevenue / monthly.length)
    : 0;
  const totalPayments = monthly?.reduce((s, m) => s + m.paymentCount, 0) ?? 0;
  const lastMonth = monthly?.[monthly.length - 1];
  const growthRate = forecast?.growthRate ?? null;
  const peakDays: string[] = forecast?.peakDays ?? [];
  const forecastAlerts: ForecastAlert[] = forecast?.alerts ?? [];
  const forecastPoints: ForecastPoint[] = forecast?.forecast ?? [];

  return (
    <div className="space-y-10 p-6" dir="rtl">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <SectionTitle>Executive Revenue Dashboard</SectionTitle>
          <GlobalText className="text-sm text-gray-500 -mt-2">
            داده واقعی از جدول payments — فقط تراکنش‌های موفق (paid)
          </GlobalText>
        </div>
        <label className="text-sm text-gray-600 flex items-center gap-2">
          ارز گزارش
          <select value={currency} onChange={(event) => setCurrency(event.target.value as RevenueCurrency)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
            <option value="IRT">ریال / نمایش تومان</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="USD">USD (واحد پایه تأیید نشده)</option>
          </select>
        </label>
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
              title="واریزی کل کیف پول (۱۲ ماه)"
              value={displayAmount(totalRevenue, currency)}
              format="currency"
              currencyLabel={currencyLabel(currency)}
            />
            <KPICard
              title="میانگین ماهانه واریزی"
              value={displayAmount(avgMonthly, currency)}
              format="currency"
              currencyLabel={currencyLabel(currency)}
            />
            <KPICard
              title="تعداد پرداخت‌ها"
              value={totalPayments}
              format="number"
            />
            <MiniStat label="آخرین ماه" value={lastMonth?.month ?? "—"} />
            {growthRate != null ? (
              <KPICard
                title="رشد پیش‌بینی‌شده"
                value={growthRate}
                format="percent"
                trend={growthRate >= 0 ? "up" : "down"}
              />
            ) : (
              <MiniStat label="رشد پیش‌بینی‌شده" value="قابل محاسبه نیست" />
            )}
          </>
        )}
      </div>

      {/* ── ۲. MRR / ARR ── */}
      <MrrSection currency={currency} />

      {/* ── ۳. نمودارهای تاریخی ── */}
      <div>
        <SectionTitle>روند شارژ کیف پول و واریزی</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mLoading ? (
            <SectionSkeleton />
          ) : (
            <MonthlyChart data={monthly ?? []} currency={currency} />
          )}
          {dLoading ? <SectionSkeleton /> : <DailyChart data={daily ?? []} currency={currency} />}
        </div>
      </div>

      {/* ── ۴. Forecast ── */}
      <div>
        <SectionTitle>پیش‌بینی واریزی کیف پول</SectionTitle>
        {fLoading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForecastChart data={forecastPoints} currency={currency} />
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
      <ProductRevenueSection currency={currency} />

      {/* ── ۶. جنسیت + ARPPU ── */}
      <GenderArppuSection currency={currency} />

      {/* ── ۷. Cohort ── */}
      <CohortSection currency={currency} />

      {/* ── ۸. Funnel ── */}
      <FunnelSection currency={currency} />

      {/* ── ۹. Attribution ── */}
      <AcquisitionGrowthSection currency={currency} />

      {/* ── ۱۰. Churn ── */}
      <ChurnSection currency={currency} />

      {/* ── ۱۱. Concentration ── */}
      <ConcentrationSection currency={currency} />

      {/* ── ۱۲. Anomalies ── */}
      {anomalies && anomalies.length > 0 && (
        <div>
          <SectionTitle>ناهنجاری‌های واریزی کیف پول</SectionTitle>
          <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
            انحراف بیش از ۴۰٪ از میانگین متحرک ۷ روزه
          </GlobalText>
          <div className="space-y-3">
            {anomalies.slice(0, 5).map((a) => (
              <AnomalyCard key={a.id} anomaly={a} currency={currency} />
            ))}
          </div>
        </div>
      )}

      {/* ── ۱۳. Strategic Decisions ── */}
      {decisions && decisions.length > 0 && (
        <div>
          <SectionTitle>پیشنهادهای مبتنی بر واریزی و جذب</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decisions.map((d) => (
              <DecisionCard key={d.id} decision={d} currency={currency} />
            ))}
          </div>
        </div>
      )}

      {/* ── ۱۴. Forecast Accuracy ── */}
      <ForecastAccuracySection currency={currency} />
    </div>
  );
}

export default withPageProtection(RevenuesPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
