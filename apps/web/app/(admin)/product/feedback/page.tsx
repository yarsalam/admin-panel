"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getMetrics,
  getConversionInsights,
  getTopFeatures,
} from "@/lib/api/product/queries/useFeedback";
import { trainIncremental } from "@/lib/api/product/mutations/useFeedback";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedbackPage() {
  const { data: metrics } = useQuery({
    queryKey: ["feedback", "metrics"],
    queryFn: getMetrics,
  });
  const { data: insights } = useQuery({
    queryKey: ["feedback", "insights"],
    queryFn: getConversionInsights,
  });
  const { data: topFeatures } = useQuery({
    queryKey: ["feedback", "top-features"],
    queryFn: getTopFeatures,
  });
  const trainMut = useMutation({
    mutationFn: (fb: any) => trainIncremental(fb),
  });

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>تحلیل بازخورد و تبدیل</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">متریک‌های کلی</h3>
          {metrics ? (
            <pre className="text-sm">{JSON.stringify(metrics, null, 2)}</pre>
          ) : (
            <Skeleton />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">نرخ تبدیل</h3>
          {insights ? (
            <p>نرخ تبدیل: {insights.conversionRate}%</p>
          ) : (
            <Skeleton />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-bold mb-2">ویژگی‌های مؤثر</h3>
        {topFeatures ? (
          <ul>
            {topFeatures.map((f: any, i: number) => (
              <li key={i}>
                {f.feature}: {f.importance.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <Skeleton />
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-bold mb-2">آموزش دستی مدل</h3>
        <CustomButton
          onClick={() => trainMut.mutate({ features: [], label: 1 })}
          label="ارسال نمونه مثبت"
          gradient
        />
      </div>
    </div>
  );
}
