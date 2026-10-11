"use client";
import { useSeoSummary } from "@/lib/api/exec/mutations/useSeo";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/shared";
import KPICard from "../KPICard";
import GlobalText from "../ui/GlobalText";

export function SeoSummaryCard() {
  const { data, isLoading } = useSeoSummary();
  const router = useRouter();

  if (isLoading) return <Skeleton className="h-40" />;
  if (!data) return null;

  // ✅ فیلدهای واقعی که سرور برمیگردونه
  const overallScore = data.overallScore ?? 0;
  const grade = data.grade ?? "N/A";
  const topRecommendations = data.topRecommendations ?? [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">خلاصه سئو</h2>
      <Card
        className="p-5 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => router.push("/exec/seo")}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <KPICard title="SEO Score" value={overallScore} format="number" />
            <GlobalText className="text-sm mt-1">Grade: {grade}</GlobalText>
          </div>
          <span className="text-sm text-blue-500">مشاهده جزئیات ←</span>
        </div>

        {topRecommendations.length > 0 && (
          <div>
            <GlobalText className="text-xs uppercase mb-2 text-gray-400">
              پیشنهادات برتر
            </GlobalText>
            {topRecommendations.slice(0, 3).map((rec: any, i: number) => (
              <div key={i} className="text-sm mb-1 text-gray-500">
                {i + 1}. {rec.title ?? rec}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
