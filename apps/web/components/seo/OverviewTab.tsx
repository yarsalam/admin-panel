"use client";

import GlobalText from "@/components/ui/GlobalText";
import KPICard from "@/components/KPICard";
import { Skeleton } from "@/components/ui/Skeleton";
import SectionTitle from "@/components/ui/SectionTitle";

import {
  useKeywordsRanking,
  useCompetitorAnalysis,
  useCampaigns,
  useSeoRecommendations,
} from "@/lib/api/exec/mutations/useSeo";
import { SeoHealthWidget } from "./SeoHealthWidget";
import { Card, MiniStat, NoData, SkeletonRows, TableHead } from "../ui/shared";

const PRIORITY_DOT: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-gray-400" };

export function OverviewTab() {
  const { data: keywords = [], isLoading: kwLoading } = useKeywordsRanking();
  const { data: competitors = [] } = useCompetitorAnalysis();
  const { data: campaigns = [], isLoading: campLoading } = useCampaigns();
  const { data: recommendations = [], isLoading: recLoading } = useSeoRecommendations();

  const totalKeywords = keywords.length;
  const avgPosition = keywords.length
    ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1)
    : "–";
  const totalVolume = keywords.reduce((s, k) => s + (k.volume ?? 0), 0);
  const highThreatCount = competitors.filter((c) => c.threatLevel === "high").length;
  const totalCampRevenue = campaigns.reduce((s, c) => s + (c.results?.revenue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kwLoading ? (
          <>
            <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
          </>
        ) : (
          <>
            <KPICard title="کلمات کلیدی فعال" value={totalKeywords} format="number" trend={totalKeywords > 0 ? "up" : undefined} />
            <KPICard title="میانگین رتبه" value={Number(avgPosition) || 0} format="number" trend={Number(avgPosition) < 15 ? "up" : "down"} />
            <KPICard title="حجم جستجوی کل" value={totalVolume} format="number" />
            <KPICard title="تهدیدات رقبا" value={highThreatCount} format="number" trend={highThreatCount > 0 ? "down" : "up"} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {kwLoading ? <Skeleton className="h-52" /> : <SeoHealthWidget keywords={keywords} />}
        </div>

        {/* 🆕 پیشنهادات واقعی از SEOScoreEngine — قبلاً فقط فیلترهای دستی
            روی keywords/competitors بود، نه منطق واقعی بک‌اند */}
        <Card className="p-5">
          <GlobalText as="h3" className="font-bold text-base mb-3">🎯 پیشنهادات</GlobalText>
          <div className="space-y-3">
            {recLoading ? (
              <><Skeleton className="h-8" /><Skeleton className="h-8" /><Skeleton className="h-8" /></>
            ) : recommendations.length === 0 ? (
              <GlobalText className="text-sm text-gray-400 py-4 text-center block">پیشنهاد فوری‌ای ثبت نشده</GlobalText>
            ) : (
              recommendations.slice(0, 6).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[rec.priority] ?? "bg-gray-400"}`} />
                  <div>
                    <GlobalText className="text-gray-700 dark:text-gray-300 font-medium">{rec.title}</GlobalText>
                    <GlobalText className="text-xs text-gray-400">{rec.description}</GlobalText>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

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
                  <NoData cols={4} msg="داده‌ای از keywords-ranking دریافت نشد" />
                ) : (
                  keywords.slice(0, 5).map((kw, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{kw.keyword}</td>
                      <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${positionBg(kw.position)}`}>#{kw.position}</span></td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{kw.volume?.toLocaleString("fa-IR") ?? "–"}</td>
                      <td className="px-4 py-2.5 text-lg">{kw.trend === "up" ? "🟢" : kw.trend === "down" ? "🔴" : "⚪"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {!campLoading && campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="درآمد کمپین‌ها" value={`$${totalCampRevenue.toFixed(0)}`} />
          <MiniStat label="هزینه کل" value={`$${campaigns.reduce((s, c) => s + c.cost, 0).toFixed(0)}`} />
          <MiniStat label="تعداد کمپین" value={campaigns.length} />
          <MiniStat
            label="میانگین ROI"
            value={`${(campaigns.reduce((s, c) => s + (c.cost > 0 ? ((c.results.revenue - c.cost) / c.cost) * 100 : 0), 0) / Math.max(campaigns.length, 1)).toFixed(0)}%`}
          />
        </div>
      )}
    </div>
  );
}