import { useSeoFullScore } from "@/lib/api/exec/mutations/useSeo";
import KPICard from "../KPICard";
import GlobalText from "../ui/GlobalText";
import { Card } from "../ui/shared";
import { Skeleton } from "../ui/Skeleton";

export function SeoIntelligenceTab() {
  const { data, isLoading } = useSeoFullScore();

  const score = data?.score;
  const breakdown = score?.breakdown;

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="SEO Score"
          value={score?.overall ?? 0}
          format="number"
        />

        <KPICard
          title="Technical"
          value={breakdown?.technical ?? 0}
          format="number"
        />

        <KPICard title="AEO" value={breakdown?.aeo ?? 0} format="number" />

        <KPICard
          title="Backlink"
          value={breakdown?.backlink ?? 0}
          format="number"
        />

        <KPICard
          title="Recommender"
          value={breakdown?.recommender ?? 0}
          format="number"
        />

        <KPICard
          title="Competitor"
          value={breakdown?.competitor ?? 0}
          format="number"
        />

        <KPICard
          title="Campaign"
          value={breakdown?.campaign ?? 0}
          format="number"
        />

        <KPICard
          title="User Signals"
          value={breakdown?.user ?? 0}
          format="number"
        />
      </div>

      <Card className="p-5">
        <GlobalText as="h3" className="font-bold mb-4">
          پیشنهادهای موتور SEO
        </GlobalText>

        <div className="space-y-2">
          {score?.recommendations?.length ? (
            score.recommendations.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-1"
              >
                <div className="font-bold">{item.title}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
                <div className="text-xs text-green-600">
                  Impact: {item.impact}
                </div>
              </div>
            ))
          ) : (
            <GlobalText className="text-gray-400">
              پیشنهادی وجود ندارد
            </GlobalText>
          )}
        </div>
      </Card>
    </div>
  );
}
