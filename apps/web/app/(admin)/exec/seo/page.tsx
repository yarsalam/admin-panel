"use client";
import { withPageProtection } from "@/components/withPageProtection";
import {
  useKeywordsRanking,
  useContentOpportunities,
  useCompetitorAnalysis,
  useSeoRecommendations,
} from "@/lib/api/exec/mutations/useSeo";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

function SeoPage() {
  const { data: keywords, isLoading: kwLoading } = useKeywordsRanking();
  const { data: opportunities, isLoading: opLoading } = useContentOpportunities();
  const { data: competitors, isLoading: compLoading } = useCompetitorAnalysis();
  const { data: recommendations } = useSeoRecommendations();

  if (kwLoading || opLoading || compLoading) return <Skeleton className="h-96" />;
  if (!keywords && !opportunities) return <ErrorState message="داده‌های سئو بارگذاری نشد" />;

  return (
    <div className="space-y-8">
      <SectionTitle>رتبه‌بندی کلمات کلیدی</SectionTitle>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right border-b">
              <th className="py-2 px-4">کلمه</th>
              <th className="py-2 px-4">رتبه</th>
              <th className="py-2 px-4">حجم جستجو</th>
              <th className="py-2 px-4">روند</th>
            </tr>
          </thead>
          <tbody>
            {keywords?.map((kw, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 px-4">{kw.keyword}</td>
                <td className="py-2 px-4">{kw.position}</td>
                <td className="py-2 px-4">{kw.volume}</td>
                <td className="py-2 px-4">
                  {kw.trend === "up" ? "🟢" : kw.trend === "down" ? "🔴" : "⚪"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>فرصت‌های محتوا</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities?.map((op, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="font-semibold">{op.title}</h3>
            <p className="text-sm opacity-70">حجم: {op.volume} | امتیاز: {op.score}</p>
          </div>
        ))}
      </div>

      <SectionTitle>تحلیل رقبا</SectionTitle>
      <ul className="space-y-2">
        {competitors?.map((comp, i) => (
          <li key={i} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
            <span className="font-medium">{comp.competitor}</span> – همپوشانی: {comp.overlap}٪
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withPageProtection(SeoPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});