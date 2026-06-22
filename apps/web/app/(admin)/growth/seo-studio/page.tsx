"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import {
  fetchContentIdeas,
  fetchBehavioralKeywords,
  fetchKeywordRankings,
  fetchCompetitorAnalysis,
  fetchAIRecommendations,
} from "@/lib/api/growth/queries/useSeoStudio";
import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";

function SeoStudioPage() {
  const [keyword, setKeyword] = useState("");
  const { data: ideas, isLoading: ideasLoad } = useQuery({
    queryKey: ["seo", "ideas"],
    queryFn: fetchContentIdeas,
  });
  const { data: keywords, isLoading: kwLoad } = useQuery({
    queryKey: ["seo", "behavioral-keywords"],
    queryFn: fetchBehavioralKeywords,
  });
  const { data: rankings, refetch: searchRank } = useQuery({
    queryKey: ["seo", "rankings", keyword],
    queryFn: () => fetchKeywordRankings(keyword),
    enabled: false,
  });
  const { data: competitors } = useQuery({
    queryKey: ["seo", "competitor-analysis"],
    queryFn: fetchCompetitorAnalysis,
  });
  const { data: recommendations } = useQuery({
    queryKey: ["seo", "ai-recommendations"],
    queryFn: fetchAIRecommendations,
  });

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>استودیو سئو</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-bold mb-2">ایده‌های محتوا</h2>
          {ideasLoad ? (
            <Skeleton className="h-20" />
          ) : (
            <ul className="space-y-2">
              {ideas?.slice(0, 5).map((idea: any, i: number) => (
                <li
                  key={i}
                  className="p-2 bg-white dark:bg-gray-800 rounded shadow"
                >
                  {idea.title || idea.keyword}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-bold mb-2">کلمات کلیدی رفتاری</h2>
          {kwLoad ? (
            <Skeleton className="h-20" />
          ) : (
            <ul className="space-y-2">
              {keywords?.slice(0, 5).map((kw: any, i: number) => (
                <li
                  key={i}
                  className="p-2 bg-white dark:bg-gray-800 rounded shadow"
                >
                  {kw.keyword}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h2 className="font-bold mb-2">بررسی رتبه کلمه کلیدی</h2>
        <div className="flex gap-2">
          <FormInput
            type="text"
            name="keyword"
            placeholder="کلمه کلیدی..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <CustomButton onClick={() => searchRank()} label="جستجو" />
        </div>
        {rankings && (
          <pre className="mt-4 text-sm">
            {JSON.stringify(rankings, null, 2)}
          </pre>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-bold mb-2">تحلیل رقبا</h2>
          {competitors ? (
            <ul className="space-y-2">
              {competitors.map((c: any) => (
                <li key={c.competitor} className="flex justify-between">
                  <span>{c.competitor}</span>
                  <span>همپوشانی: {c.overlap}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-10" />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-bold mb-2">توصیه‌های هوش مصنوعی</h2>
          {recommendations ? (
            <ul className="space-y-2">
              {recommendations.map((rec: any, i: number) => (
                <li key={i} className="text-sm">
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-10" />
          )}
        </div>
      </div>
    </div>
  );
}

export default withPageProtection(SeoStudioPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
