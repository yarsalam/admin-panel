
"use client";

import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";
import GlobalText from "@/components/ui/GlobalText";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, MiniStat } from "@/components/ui/shared";
import CampaignForm from "@/components/referral/CampaignForm";
import {
  useReferralCampaigns,
  useReferralStats,
  useTopReferrers,
} from "@/lib/api/growth/useReferrals";

function ReferralsPage() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const { data: campaigns, isLoading: campaignsLoading, isError: campaignsError } =
    useReferralCampaigns();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: topReferrers, isLoading: referrersLoading } = useTopReferrers(10);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>مدیریت معرفی دوستان</SectionTitle>
          <GlobalText className="text-sm text-gray-500 -mt-2">
            کمپین‌های دعوت، نرخ تبدیل و کاربران معرفی‌کننده
          </GlobalText>
        </div>
        <button
          type="button"
          onClick={() => setShowCampaignForm(true)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          ایجاد کمپین
        </button>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniStat label="کل دعوت‌ها" value={stats.totalReferrals.toLocaleString("fa-IR")} />
          <MiniStat label="نرخ تبدیل" value={`${stats.conversionRate.toLocaleString("fa-IR")}٪`} />
          <MiniStat label="کمپین‌های فعال" value={stats.activeCampaigns.toLocaleString("fa-IR")} />
        </div>
      ) : (
        <Card className="p-5 text-sm text-gray-500">
          آمار معرفی دوستان در دسترس نیست.
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle>کمپین‌های معرفی</SectionTitle>
          {campaignsLoading ? (
            <Skeleton className="h-40" />
          ) : campaignsError ? (
            <GlobalText className="text-sm text-red-500">
              دریافت کمپین‌ها ناموفق بود.
            </GlobalText>
          ) : !campaigns?.length ? (
            <GlobalText className="text-sm text-gray-500 py-5 text-center">
              هنوز کمپینی ثبت نشده است.
            </GlobalText>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-gray-500">
                    <th className="py-2">نام</th>
                    <th className="py-2">پاداش</th>
                    <th className="py-2">مقدار</th>
                    <th className="py-2">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{campaign.name}</td>
                      <td className="py-3">{campaign.rewardType}</td>
                      <td className="py-3">{campaign.rewardValue.toLocaleString("fa-IR")}</td>
                      <td className="py-3">{campaign.isActive ? "فعال" : "غیرفعال"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle>معرف‌های برتر</SectionTitle>
          {referrersLoading ? (
            <Skeleton className="h-40" />
          ) : !topReferrers?.length ? (
            <GlobalText className="text-sm text-gray-500 py-5 text-center">
              داده‌ای برای معرفی‌کنندگان برتر وجود ندارد.
            </GlobalText>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {topReferrers.map((referrer) => (
                <div key={referrer.userId} className="flex items-center justify-between py-3">
                  <span className="font-medium">{referrer.username}</span>
                  <span className="text-sm text-gray-500">
                    {referrer.referralCount.toLocaleString("fa-IR")} دعوت
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showCampaignForm && (
        <CampaignForm onClose={() => setShowCampaignForm(false)} />
      )}
    </div>
  );
}

export default withPageProtection(ReferralsPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
