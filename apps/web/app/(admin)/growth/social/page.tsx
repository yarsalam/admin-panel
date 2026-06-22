"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import { fetchBrandSentiment } from "@/lib/api/growth/queries/useSocial";
import {
  useScanTelegram,
  useAnalyzeTexts,
} from "@/lib/api/growth/mutations/useSocial";
import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Skeleton } from "@/components/ui/Skeleton";

function SocialPage() {
  const [brand, setBrand] = useState("yarsalam");
  const { data: sentiment, isLoading } = useQuery({
    queryKey: ["social", "sentiment", brand],
    queryFn: () => fetchBrandSentiment(brand),
  });
  const scanMut = useScanTelegram();
  const analyzeMut = useAnalyzeTexts();

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>شنود اجتماعی</SectionTitle>

      <div className="flex gap-4">
        <button
          onClick={() => scanMut.mutate()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          اسکن کانال‌های تلگرام
        </button>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="نام برند"
          className="border p-2 rounded dark:bg-gray-800"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-20" />
      ) : sentiment ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-bold mb-2">تحلیل احساسات برند</h2>
          <pre className="text-sm">{JSON.stringify(sentiment, null, 2)}</pre>
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h2 className="font-bold mb-2">تحلیل متون دستی</h2>
        <button
          onClick={() => analyzeMut.mutate(["متن نمونه ۱", "متن نمونه ۲"])}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          تحلیل
        </button>
      </div>
    </div>
  );
}

export default withPageProtection(SocialPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
