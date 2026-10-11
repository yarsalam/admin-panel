"use client";

import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import KPICard from "@/components/KPICard";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import GlobalText from "@/components/ui/GlobalText";
import CustomButton from "@/components/ui/CustomButton";
import {
  useKeywordsRanking,
  useHighIntentContent,
  useContentIdeas,
  useBehavioralKeywords,
  useCompetitorAnalysis,
  useSerpFeatures,
  useGoogleTrends,
  useCampaigns,
} from "@/lib/api/exec/mutations/useSeo";
import { SeoIntelligenceTab } from "@/components/seo/SeoIntelligenceTab";
import { SeoHealthWidget } from "@/components/seo/SeoHealthWidget";
import { ForecastTab } from "@/components/seo/ForecastTab";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "overview"
  | "keywords"
  | "content"
  | "competitors"
  | "campaigns"
  | "forecast"
  | "trends"
  | "intelligence";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function positionBg(pos: number): string {
  if (pos <= 3)
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (pos <= 10)
    return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (pos <= 20)
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
}

function threatBg(level?: "high" | "medium" | "low"): string {
  if (level === "high")
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (level === "medium")
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

function priorityBg(p: string): string {
  if (p === "high")
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (p === "medium")
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
}

function sourceIcon(s: string): string {
  return { hobby: "🎯", city: "🏙️", value: "💎", search: "🔍" }[s] ?? "📝";
}

function platformIcon(p: string): string {
  return (
    {
      instagram: "📸",
      telegram: "✈️",
      linkedin: "💼",
      google_ads: "🎯",
      medium: "📝",
      other: "🌐",
    }[p] ?? "🌐"
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({
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

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

function TableHead({ cols }: { cols: string[] }) {
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

function SkeletonRows({
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

function NoData({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center">
        <GlobalText className="text-sm text-gray-400">{msg}</GlobalText>
      </td>
    </tr>
  );
}

function ProgressBar({
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

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: keywords = [], isLoading: kwLoading } = useKeywordsRanking();
  const { data: competitors = [], isLoading: compLoading } =
    useCompetitorAnalysis();
  const { data: campaigns = [], isLoading: campLoading } = useCampaigns();
  const { data: ideas = [], isLoading: ideasLoading } = useContentIdeas();

  const totalKeywords = keywords.length;
  const avgPosition = keywords.length
    ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(
        1,
      )
    : "–";
  const totalVolume = keywords.reduce((s, k) => s + (k.volume ?? 0), 0);
  const highThreatCount = competitors.filter(
    (c) => c.threatLevel === "high",
  ).length;
  const totalCampRevenue = campaigns.reduce(
    (s, c) => s + (c.results?.revenue ?? 0),
    0,
  );
  const highIdeas = ideas.filter((i) => i.priority === "high").length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kwLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <KPICard
              title="کلمات کلیدی فعال"
              value={totalKeywords}
              format="number"
              trend={totalKeywords > 0 ? "up" : undefined}
            />
            <KPICard
              title="میانگین رتبه"
              value={Number(avgPosition) || 0}
              format="number"
              trend={Number(avgPosition) < 15 ? "up" : "down"}
            />
            <KPICard
              title="حجم جستجوی کل"
              value={totalVolume}
              format="number"
            />
            <KPICard
              title="تهدیدات رقبا"
              value={highThreatCount}
              format="number"
              trend={highThreatCount > 0 ? "down" : "up"}
            />
          </>
        )}
      </div>

      {/* Health + Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {kwLoading ? (
            <Skeleton className="h-52" />
          ) : (
            <SeoHealthWidget keywords={keywords} />
          )}
        </div>

        {/* Action Center */}
        <Card className="p-5">
          <GlobalText as="h3" className="font-bold text-base mb-3">
            🎯 مرکز اقدام
          </GlobalText>
          <div className="space-y-2">
            {kwLoading || campLoading || ideasLoading ? (
              <>
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </>
            ) : (
              <>
                {keywords.filter((k) => k.position > 20).length > 0 && (
                  <ActionItem
                    color="red"
                    text={`${keywords.filter((k) => k.position > 20).length} کلمه با رتبه ضعیف (بالای ۲۰)`}
                  />
                )}
                {highThreatCount > 0 && (
                  <ActionItem
                    color="orange"
                    text={`${highThreatCount} رقیب با تهدید بالا شناسایی شد`}
                  />
                )}
                {highIdeas > 0 && (
                  <ActionItem
                    color="blue"
                    text={`${highIdeas} فرصت محتوایی با اولویت بالا`}
                  />
                )}
                {totalCampRevenue === 0 && campaigns.length === 0 && (
                  <ActionItem
                    color="gray"
                    text="هنوز کمپین سئویی ثبت نشده است"
                  />
                )}
                {keywords.filter((k) => k.trend === "down").length > 0 && (
                  <ActionItem
                    color="orange"
                    text={`${keywords.filter((k) => k.trend === "down").length} کلمه روند نزولی دارند`}
                  />
                )}
                {keywords.filter((k) => k.position <= 3).length > 0 && (
                  <ActionItem
                    color="green"
                    text={`${keywords.filter((k) => k.position <= 3).length} کلمه در ۳ رتبه اول ✓`}
                  />
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Top 5 keywords quick view */}
      <div>
        <SectionTitle>برترین کلمات کلیدی</SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead cols={["کلمه کلیدی", "رتبه", "حجم", "روند"]} />
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {kwLoading ? (
                  <SkeletonRows rows={5} cols={4} />
                ) : keywords.length === 0 ? (
                  <NoData
                    cols={4}
                    msg="داده‌ای از keywords-ranking دریافت نشد"
                  />
                ) : (
                  keywords.slice(0, 5).map((kw, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${positionBg(kw.position)}`}
                        >
                          #{kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {kw.volume?.toLocaleString("fa-IR") ?? "–"}
                      </td>
                      <td className="px-4 py-2.5 text-lg">
                        {kw.trend === "up"
                          ? "🟢"
                          : kw.trend === "down"
                            ? "🔴"
                            : "⚪"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Campaign revenue summary */}
      {!campLoading && campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat
            label="درآمد کمپین‌ها"
            value={`$${totalCampRevenue.toFixed(0)}`}
          />
          <MiniStat
            label="هزینه کل"
            value={`$${campaigns.reduce((s, c) => s + c.cost, 0).toFixed(0)}`}
          />
          <MiniStat label="تعداد کمپین" value={campaigns.length} />
          <MiniStat
            label="میانگین ROI"
            value={`${(
              campaigns.reduce((s, c) => {
                const roi =
                  c.cost > 0
                    ? ((c.results.revenue - c.cost) / c.cost) * 100
                    : 0;
                return s + roi;
              }, 0) / Math.max(campaigns.length, 1)
            ).toFixed(0)}%`}
          />
        </div>
      )}
    </div>
  );
}

function ActionItem({
  color,
  text,
}: {
  color: "red" | "orange" | "blue" | "green" | "gray";
  text: string;
}) {
  const dot: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    gray: "bg-gray-400",
  };
  return (
    <div className="flex items-start gap-2 text-sm">
      <span
        className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${dot[color]}`}
      />
      <GlobalText className="text-gray-700 dark:text-gray-300">
        {text}
      </GlobalText>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <GlobalText className="text-xs text-gray-500 mb-1">{label}</GlobalText>
      <GlobalText className="text-xl font-bold">{String(value)}</GlobalText>
    </Card>
  );
}

// ─── Tab: Keywords ────────────────────────────────────────────────────────────

function KeywordsTab() {
  const { data: keywords = [], isLoading } = useKeywordsRanking();
  const { data: behavioral = [], isLoading: bLoading } =
    useBehavioralKeywords();
  const [serpInput, setSerpInput] = useState("");
  const [serpQuery, setSerpQuery] = useState("");
  const { data: serp, isLoading: serpLoading } = useSerpFeatures(serpQuery);

  return (
    <div className="space-y-6">
      {/* Keyword table */}
      <div>
        <SectionTitle>رتبه‌بندی کلمات کلیدی</SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead
                cols={[
                  "#",
                  "کلمه کلیدی",
                  "رتبه",
                  "حجم جستجو",
                  "روند",
                  "دشواری",
                ]}
              />
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <SkeletonRows rows={6} cols={6} />
                ) : keywords.length === 0 ? (
                  <NoData
                    cols={6}
                    msg="داده‌ای دریافت نشد — SERPAPI_KEY را در .env بررسی کنید"
                  />
                ) : (
                  keywords.map((kw, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${positionBg(kw.position)}`}
                        >
                          #{kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {kw.volume?.toLocaleString("fa-IR") ?? "–"}
                      </td>
                      <td className="px-4 py-2.5 text-base">
                        {kw.trend === "up"
                          ? "🟢"
                          : kw.trend === "down"
                            ? "🔴"
                            : "⚪"}
                      </td>
                      <td className="px-4 py-2.5">
                        {kw.difficulty !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <ProgressBar
                                value={kw.difficulty}
                                color={
                                  kw.difficulty > 70
                                    ? "bg-red-500"
                                    : kw.difficulty > 40
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {kw.difficulty}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* SERP Features */}
      <div>
        <SectionTitle>بررسی SERP Features</SectionTitle>
        <Card className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={serpInput}
              onChange={(e) => setSerpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSerpQuery(serpInput)}
              placeholder="کلمه کلیدی برای بررسی Featured Snippet, PAA..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CustomButton
              label="بررسی"
              onClick={() => setSerpQuery(serpInput)}
              disabled={!serpInput}
              className="!w-auto px-5"
            />
          </div>

          {serpLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              در حال دریافت داده‌های SERP...
            </div>
          )}

          {!serpQuery && !serpLoading && (
            <GlobalText className="text-sm text-gray-400 text-center py-4">
              یک کلمه کلیدی وارد کنید تا ویژگی‌های SERP آن تحلیل شود
            </GlobalText>
          )}

          {serp && !serpLoading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-1">
              {serp.opportunity && (
                <div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                    فرصت شناسایی‌شده
                  </span>
                  <GlobalText className="font-semibold mt-1">
                    {serp.opportunity}
                  </GlobalText>
                </div>
              )}
              {serp.recommendation && (
                <GlobalText className="text-sm text-gray-600 dark:text-gray-300">
                  {serp.recommendation}
                </GlobalText>
              )}
              {serp.message && (
                <GlobalText className="text-sm text-gray-600 dark:text-gray-300">
                  {serp.message}
                </GlobalText>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Behavioral Keywords */}
      <div>
        <SectionTitle>کلمات کلیدی رفتاری (LTV-Based)</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          کلماتی که کاربران واقعی‌تان با LTV بالا از طریق آن‌ها وارد شده‌اند
        </GlobalText>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead
                cols={[
                  "کلمه کلیدی",
                  "کاربران",
                  "میانگین LTV",
                  "Retention",
                  "امتیاز اولویت",
                  "توصیه",
                ]}
              />
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bLoading ? (
                  <SkeletonRows rows={5} cols={6} />
                ) : behavioral.length === 0 ? (
                  <NoData
                    cols={6}
                    msg="داده کافی از رفتار جستجوی کاربران وجود ندارد"
                  />
                ) : (
                  behavioral.map((kw, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {kw.users?.toLocaleString("fa-IR")}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                        ${kw.avgLTV?.toFixed(0)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-sm font-medium ${
                            kw.avgRetention > 0.3
                              ? "text-emerald-600"
                              : kw.avgRetention > 0.15
                                ? "text-amber-600"
                                : "text-red-500"
                          }`}
                        >
                          {(kw.avgRetention * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="w-20">
                          <ProgressBar
                            value={kw.priorityScore}
                            max={Math.max(
                              ...behavioral.map((b) => b.priorityScore),
                              1,
                            )}
                            color="bg-purple-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs truncate">
                        {kw.recommendation}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Content ─────────────────────────────────────────────────────────────

function ContentTab() {
  const { data: highIntent = [], isLoading: hiLoading } =
    useHighIntentContent();
  const { data: ideas = [], isLoading: idLoading } = useContentIdeas();

  return (
    <div className="space-y-6">
      {/* High-intent */}
      <div>
        <SectionTitle>محتوای High-Intent</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          کلماتی که کاربران پرداخت‌کننده واقعی از آن‌ها آمده‌اند — LTV بالای
          $۱۰۰
        </GlobalText>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead
                cols={[
                  "کلمه کلیدی",
                  "عنوان پیشنهادی",
                  "LTV",
                  "کاربران",
                  "درآمد",
                  "اولویت",
                ]}
              />
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {hiLoading ? (
                  <SkeletonRows rows={5} cols={6} />
                ) : highIntent.length === 0 ? (
                  <NoData
                    cols={6}
                    msg="داده کافی وجود ندارد — نیاز به حداقل ۵ کاربر با acquisitionKeyword و LTV بالای $۱۰۰"
                  />
                ) : (
                  highIntent.map((op, i) => {
                    const maxP = Math.max(
                      ...highIntent.map((o) => o.priority),
                      1,
                    );
                    return (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                          {op.keyword}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs">
                          {op.title}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                          ${op.expectedLTV?.toFixed(0)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                          {op.estimatedUsers?.toLocaleString("fa-IR")}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                          ${op.totalRevenue?.toFixed(0)}
                        </td>
                        <td className="px-4 py-2.5 w-24">
                          <ProgressBar
                            value={op.priority}
                            max={maxP}
                            color="bg-emerald-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Content ideas cards */}
      <div>
        <SectionTitle>ایده‌های محتوا</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          بر اساس هابی‌های کاربران، شهرهای کم‌کاربر و ارزش‌های موفق
        </GlobalText>
        {idLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <EmptyState message="ایده‌ای یافت نشد — به داده‌های بیشتری از کاربران نیاز است" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ideas.map((idea, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <GlobalText
                    as="h3"
                    className="font-semibold text-sm leading-snug"
                  >
                    {idea.title}
                  </GlobalText>
                  <span className="text-xl flex-shrink-0">
                    {sourceIcon(idea.source)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {idea.keywords?.map((kw, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${priorityBg(idea.priority)}`}
                  >
                    {idea.priority === "high"
                      ? "اولویت بالا"
                      : idea.priority === "medium"
                        ? "اولویت متوسط"
                        : "اولویت پایین"}
                  </span>
                  <GlobalText className="text-xs text-gray-400">
                    ~{idea.estimatedTraffic?.toLocaleString("fa-IR")} بازدید
                  </GlobalText>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Competitors ─────────────────────────────────────────────────────────

function CompetitorsTab() {
  const { data: competitorsRaw = [], isLoading } = useCompetitorAnalysis();
  const competitors = Array.isArray(competitorsRaw) ? competitorsRaw : [];

  const highCount = competitors.filter((c) => c.threatLevel === "high").length;
  const midCount = competitors.filter((c) => c.threatLevel === "medium").length;

  return (
    <div className="space-y-6">
      {!isLoading && competitors.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="تعداد رقبا" value={competitors.length} />
          <MiniStat label="تهدید بالا" value={highCount} />
          <MiniStat label="تهدید متوسط" value={midCount} />
        </div>
      )}

      <div>
        <SectionTitle>تحلیل رقبا</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          همپوشانی کلمات کلیدی، نقاط قوت و سطح تهدید
        </GlobalText>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <EmptyState message="داده‌ای از رقبا یافت نشد — سرویس تحلیل رقبا را پیکربندی کنید" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {comp.competitor?.charAt(0)}
                  </div>
                  <div>
                    <GlobalText as="h3" className="font-bold">
                      {comp.competitor}
                    </GlobalText>
                    {comp.traffic && (
                      <GlobalText className="text-xs text-gray-400">
                        {comp.traffic?.toLocaleString("fa-IR")} بازدید/ماه
                      </GlobalText>
                    )}
                  </div>
                </div>
                {comp.threatLevel && (
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${threatBg(comp.threatLevel)}`}
                  >
                    {comp.threatLevel === "high"
                      ? "تهدید بالا"
                      : comp.threatLevel === "medium"
                        ? "تهدید متوسط"
                        : "تهدید پایین"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>همپوشانی کلمات کلیدی</span>
                    <span className="font-medium text-blue-600">
                      {comp.overlap}٪
                    </span>
                  </div>
                  <ProgressBar
                    value={comp.overlap}
                    color={
                      comp.overlap > 60
                        ? "bg-red-500"
                        : comp.overlap > 30
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }
                  />
                </div>
                <div>
                  <GlobalText className="text-xs text-gray-500 mb-1.5">
                    نقاط قوت
                  </GlobalText>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.strength?.map((s, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Campaigns ───────────────────────────────────────────────────────────

function CampaignsTab() {
  const { data: campaignsRaw = [], isLoading } = useCampaigns();
  const campaigns = Array.isArray(campaignsRaw) ? campaignsRaw : [];

  const totalRevenue = campaigns.reduce(
    (s, c) => s + (c.results?.revenue ?? 0),
    0,
  );
  const totalCost = campaigns.reduce((s, c) => s + (c.cost ?? 0), 0);
  const totalROI =
    totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {!isLoading && campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            title="درآمد کل کمپین‌ها"
            value={totalRevenue}
            format="currency"
            trend={totalRevenue > 0 ? "up" : undefined}
          />
          <KPICard title="هزینه کل" value={totalCost} format="currency" />
          <KPICard
            title="ROI کلی"
            value={Math.round(totalROI)}
            format="percent"
            trend={totalROI > 0 ? "up" : "down"}
          />
          <KPICard
            title="تعداد کمپین"
            value={campaigns.length}
            format="number"
          />
        </div>
      )}

      <div>
        <SectionTitle>کمپین‌های سئو</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          همه فعالیت‌های رشد: پست شبکه اجتماعی، بک‌لینک، تبلیغات
        </GlobalText>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead
              cols={[
                "پلتفرم",
                "نوع",
                "هزینه",
                "کلیک",
                "ثبت‌نام",
                "درآمد",
                "ROI",
                "تاریخ",
              ]}
            />
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <SkeletonRows rows={5} cols={8} />
              ) : campaigns.length === 0 ? (
                <NoData cols={8} msg="هیچ فعالیت کمپینی ثبت نشده است" />
              ) : (
                campaigns.map((camp, i) => {
                  const roi =
                    camp.cost > 0
                      ? ((camp.results.revenue - camp.cost) / camp.cost) * 100
                      : 0;
                  return (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          {platformIcon(camp.platform)} {camp.platform}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {camp.type}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        ${camp.cost}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {camp.results.clicks?.toLocaleString("fa-IR")}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                        {camp.results.registrations?.toLocaleString("fa-IR")}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                        ${camp.results.revenue}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-sm font-bold ${
                            roi > 100
                              ? "text-emerald-600"
                              : roi > 0
                                ? "text-amber-600"
                                : "text-red-500"
                          }`}
                        >
                          {roi.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {new Date(camp.performedAt).toLocaleDateString("fa-IR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Trends ─────────────────────────────────────────────────────────────

function TrendsTab() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [geo, setGeo] = useState("IR");
  const { data: trends, isLoading } = useGoogleTrends(query, geo);

  const timeline =
    trends?.default?.timelineData?.map((d) => ({
      time: d.formattedTime,
      value: d.value?.[0] ?? 0,
    })) ?? [];

  const maxVal = Math.max(...timeline.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Google Trends</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          روند جستجوی کلمات کلیدی در زمان — داده واقعی از Google
        </GlobalText>
      </div>

      <Card className="p-5">
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(input)}
            placeholder="مثال: همسریابی"
            className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={geo}
            onChange={(e) => setGeo(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="IR">ایران</option>
            <option value="AF">افغانستان</option>
            <option value="TR">ترکیه</option>
            <option value="">جهانی</option>
          </select>
          <CustomButton
            label="دریافت روند"
            onClick={() => setQuery(input)}
            disabled={!input}
            className="!w-auto px-5"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <GlobalText className="text-sm">
              در حال دریافت داده‌ها...
            </GlobalText>
          </div>
        )}

        {!query && !isLoading && (
          <div className="py-12 text-center">
            <GlobalText className="text-gray-400 text-sm">
              یک کلمه کلیدی وارد کنید تا روند جستجوی آن در Google نمایش داده شود
            </GlobalText>
          </div>
        )}

        {timeline.length > 0 && !isLoading && (
          <div>
            <div className="flex items-end gap-0.5 h-40 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
              {timeline.map((point, i) => {
                const pct = (point.value / maxVal) * 100;
                return (
                  <div
                    key={i}
                    title={`${point.time}: ${point.value}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer rounded-sm"
                    style={{ height: `${pct}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>{timeline[0]?.time}</span>
              <span>{timeline[timeline.length - 1]?.time}</span>
            </div>
          </div>
        )}

        {query && !isLoading && timeline.length === 0 && (
          <EmptyState message="داده‌ای برای این کلمه کلیدی در منطقه انتخابی یافت نشد" />
        )}
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "نمای کلی", icon: "📊" },
  { id: "keywords", label: "کلمات کلیدی", icon: "🔑" },
  { id: "content", label: "محتوا", icon: "✍️" },
  { id: "competitors", label: "رقبا", icon: "🏁" },
  { id: "campaigns", label: "کمپین‌ها", icon: "📣" },
  { id: "forecast", label: "پیش‌بینی AI", icon: "🤖" },
  { id: "trends", label: "Google Trends", icon: "📈" },
  {
    id: "intelligence",
    label: "SEO Intelligence",
    icon: "🧠",
  },
];

function SeoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: competitors = [] } = useCompetitorAnalysis();
  const { data: campaigns = [] } = useCampaigns();

  const getBadge = (id: TabId): number | undefined => {
    if (id === "competitors")
      return (
        competitors.filter((c) => c.threatLevel === "high").length || undefined
      );
    if (id === "campaigns") return campaigns.length || undefined;
    return undefined;
  };
  console.log("activeTab:", activeTab);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <GlobalText as="h1" className="text-2xl font-bold">
              مدیریت سئو
            </GlobalText>
            <GlobalText className="text-sm text-gray-500 mt-0.5">
              سئوی داخلی، خارجی، محتوا، رقبا و پیش‌بینی هوشمند
            </GlobalText>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse block" />
            داده زنده
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              badge={getBadge(tab.id)}
            >
              <span className="ml-1.5">{tab.icon}</span>
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "keywords" && <KeywordsTab />}
        {activeTab === "content" && <ContentTab />}
        {activeTab === "competitors" && <CompetitorsTab />}
        {activeTab === "campaigns" && <CampaignsTab />}
        {activeTab === "forecast" && <ForecastTab />}
        {activeTab === "trends" && <TrendsTab />}
        {activeTab === "intelligence" && <SeoIntelligenceTab />}
      </div>
    </div>
  );
}

export default withPageProtection(SeoPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
