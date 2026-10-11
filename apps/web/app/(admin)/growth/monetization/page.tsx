"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import { fetchFeedbackCount } from "@/lib/api/growth/queries/useMonetization";
import {
  usePredictPromotion,
  useSendMonetizationFeedback,
  useRetrainModel,
  useTrainModel,
} from "@/lib/api/growth/mutations/useMonetization";
import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";

function MonetizationPage() {
  const { data: feedbackCount } = useQuery({
    queryKey: ["monetization", "feedback-count"],
    queryFn: fetchFeedbackCount,
  });
  const predictMut = usePredictPromotion();
  const feedbackMut = useSendMonetizationFeedback();
  const retrainMut = useRetrainModel();
  const trainMut = useTrainModel();

  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = () => {
    predictMut.mutate(
      { userId: 1, features: {}, candidates: ["off1", "off2"] },
      {
        onSuccess: (data) => setPrediction(data),
      },
    );
  };

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>بهینه‌ساز درآمد</SectionTitle>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h2 className="font-bold mb-2">تست A/B تبلیغات</h2>
        <CustomButton
          onClick={handlePredict}
          label="پیش‌بینی بهترین پیشنهاد"
          gradient
        />
        {prediction && (
          <pre className="mt-4 text-sm">
            {JSON.stringify(prediction, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() =>
            feedbackMut.mutate({
              userId: 1,
              variant: "off1",
              features: {},
              label: 1,
            })
          }
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          ثبت بازخورد مثبت
        </button>
        <button
          onClick={() =>
            feedbackMut.mutate({
              userId: 1,
              variant: "off1",
              features: {},
              label: 0,
            })
          }
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          ثبت بازخورد منفی
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <p className="text-sm">
          تعداد بازخوردهای جمع‌آوری‌شده: {feedbackCount?.count ?? 0}
        </p>
        <div className="flex gap-3 mt-3">
          <CustomButton
            onClick={() => retrainMut.mutate()}
            label="بازآموزی مدل"
            gradient
          />
          <CustomButton
            onClick={() => trainMut.mutate()}
            label="آموزش اولیه مدل"
          />
        </div>
      </div>
    </div>
  );
}

export default withPageProtection(MonetizationPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
