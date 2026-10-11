"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCampaigns,
  fetchAnalyzeCampaigns,
  fetchLTVBySource,
} from "@/lib/api/growth/queries/useCampaigns";
import {
  useCreateCampaign,
  useForecastTraffic,
  useSendCampaignFeedback,
} from "@/lib/api/growth/mutations/useCampaigns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

function CampaignsPage() {
  const {
    data: campaigns,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["growth", "campaigns"],
    queryFn: fetchCampaigns,
  });
  const { data: analysis, refetch: runAnalysis } = useQuery({
    queryKey: ["growth", "campaigns", "analyze"],
    queryFn: fetchAnalyzeCampaigns,
    enabled: false,
  });
  const { data: ltvData } = useQuery({
    queryKey: ["growth", "ltv-by-source"],
    queryFn: fetchLTVBySource,
  });

  const createMut = useCreateCampaign();
  const forecastMut = useForecastTraffic();
  const feedbackMut = useSendCampaignFeedback();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      platform: "instagram",
      type: "social_post",
      budget: 100000,
    },
  });

  const onSubmit = (data: any) => {
    createMut.mutate(data);
    reset();
  };

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>مدیریت کمپین‌ها</SectionTitle>

      {/* ایجاد کمپین جدید */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3 max-w-md"
      >
        <FormInput
          type="text"
          label="پلتفرم"
          name="platform"
          control={control}
        />
        <FormInput type="text" label="نوع" name="type" control={control} />
        <FormInput
          type="number"
          label="بودجه (تومان)"
          name="budget"
          control={control}
        />
        <CustomButton
          type="submit"
          label="ایجاد کمپین"
          gradient
          loading={createMut.isPending}
        />
      </form>

      {/* لیست کمپین‌ها */}
      {isLoading && <Skeleton className="h-40" />}
      {isError && <ErrorState message="خطا در بارگذاری کمپین‌ها" />}
      {campaigns && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white dark:bg-gray-800 rounded-xl shadow">
            <thead>
              <tr className="text-right border-b">
                <th className="p-2">شناسه</th>
                <th className="p-2">پلتفرم</th>
                <th className="p-2">نوع</th>
                <th className="p-2">هزینه</th>
                <th className="p-2">نتایج</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.id}</td>
                  <td className="p-2">{c.platform}</td>
                  <td className="p-2">{c.type}</td>
                  <td className="p-2">{c.cost?.toLocaleString()} تومان</td>
                  <td className="p-2">{JSON.stringify(c.results)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* تحلیل کمپین‌ها */}
      <div className="flex gap-3">
        <button
          onClick={() => runAnalysis()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          تحلیل کمپین‌ها
        </button>
        <button
          onClick={() => forecastMut.mutate({ historicalData: [] })}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          پیش‌بینی ترافیک
        </button>
        <button
          onClick={() => feedbackMut.mutate(campaigns)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          بازخورد به AI
        </button>
      </div>
      {analysis && (
        <pre className="bg-gray-100 p-4 rounded-lg">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      )}

      {/* LTV به تفکیک منبع */}
      <SectionTitle>LTV به تفکیک منبع</SectionTitle>
      {ltvData && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(ltvData).map(([source, ltv]: any) => (
            <div
              key={source}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
            >
              <p className="text-gray-500">{source}</p>
              <p className="text-xl font-bold">
                {Number(ltv).toLocaleString()} تومان
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withPageProtection(CampaignsPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
