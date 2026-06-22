"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import {
  useUserProfile,
  useUserActivity,
  useUserFinancial,
  useUserReports,
  useAiAdvice,
} from "@/lib/api/safety/mutations/useUser360";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import ProfileCard from "@/components/safety/ProfileCard";
import ImageGallery from "@/components/safety/ImageGallery";
import ActivityTimeline from "@/components/safety/ActivityTimeline";
import FinancialSummary from "@/components/safety/FinancialSummary";
import ReportsList from "@/components/safety/ReportsList";
import AiAdvicePanel from "@/components/safety/AiAdvicePanel";

const tabs = ["مشخصات", "عکس‌ها", "فعالیت", "مالی", "گزارش‌ها", "دستیار AI"];

function User360Page() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id);
  const { data: profile, isLoading, error } = useUserProfile(userId);
  const { data: activity } = useUserActivity(userId);
  const { data: financial } = useUserFinancial(userId);
  const { data: reports } = useUserReports(userId);
  const { data: advice } = useAiAdvice(userId);

  if (isLoading) return <Skeleton className="h-96" />;
  if (error || !profile)
    return <ErrorState message="خطا در بارگذاری پروفایل" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">پروفایل {profile.nickname}</h1>
      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          {tabs.map((t) => (
            <Tab
              key={t}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? "bg-white dark:bg-gray-800 shadow"
                    : "text-gray-500 hover:bg-white/[0.12]"
                }`
              }
            >
              {t}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <ProfileCard user={profile} />
          </Tab.Panel>
          <Tab.Panel>
            <ImageGallery userId={userId} />
          </Tab.Panel>
          <Tab.Panel>
            <ActivityTimeline data={activity} />
          </Tab.Panel>
          <Tab.Panel>
            <FinancialSummary data={financial} />
          </Tab.Panel>
          <Tab.Panel>
            <ReportsList reports={reports} userId={userId} />
          </Tab.Panel>
          <Tab.Panel>
            <AiAdvicePanel advice={advice} userId={userId} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default withPageProtection(User360Page, {
  panelPermission: "view_safety_panel",
  itemPermissions: "manage_users",
});
