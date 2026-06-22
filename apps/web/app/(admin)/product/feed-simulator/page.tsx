"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/lib/api/product/queries/useFeedSimulator";
import { useAnalyzeImage } from "@/lib/api/product/mutations/useFeedSimulator";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { withPageProtection } from "@/components/withPageProtection";

function FeedSimulatorPage() {
  const [userId, setUserId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const {
    data: feed,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["feed-simulator", userId],
    queryFn: () => fetchFeed(Number(userId)),
    enabled: false,
  });
  const analyzeMut = useAnalyzeImage();

  return (
    <div className="space-y-6 p-4">
      <SectionTitle>شبیه‌ساز فید</SectionTitle>
      <div className="flex gap-4 items-end">
        <input
          type="number"
          placeholder="شناسه کاربر"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border rounded p-2"
        />
        <CustomButton onClick={() => refetch()} label="بارگذاری فید" gradient />
      </div>

      {isLoading && <Skeleton className="h-40" />}
      {feed && (
        <div className="space-y-3">
          {feed.slice(0, 5).map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow"
            >
              <p>
                <strong>کاربر:</strong> {item.nickname}
              </p>
              <p>
                <strong>شهر:</strong> {item.city}
              </p>
              {item.avatar && (
                <img
                  src={item.avatar}
                  className="w-16 h-16 rounded-full mt-2"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-2">
        <h3 className="font-bold">تحلیل کیفیت عکس</h3>
        <input
          type="text"
          placeholder="آدرس عکس"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <CustomButton
          onClick={() => analyzeMut.mutate(imageUrl)}
          label="بررسی کیفیت"
          loading={analyzeMut.isPending}
        />
        {analyzeMut.data && (
          <pre className="text-sm">
            {JSON.stringify(analyzeMut.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
export default withPageProtection(FeedSimulatorPage, {
  panelPermission: "view_product_panel",
  itemPermissions: ["edit_content", "delete_content"],
});
