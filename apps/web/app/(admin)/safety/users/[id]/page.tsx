"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import { useUser360 } from "@/lib/api/safety/queries/useUser360";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

// تب‌ها — lazy import برای کاهش bundle اولیه
import dynamic from "next/dynamic";
const OverviewTab = dynamic(() => import("../_components/tabs/OverviewTab"));
const ImagesTab = dynamic(() => import("../_components/tabs/ImagesTab"));
const ActivityTab = dynamic(() => import("../_components/tabs/ActivityTab"));
const FinancialTab = dynamic(() => import("../_components/tabs/FinancialTab"));
const ReportsTab = dynamic(() => import("../_components/tabs/ReportsTab"));
const RelationsTab = dynamic(() => import("../_components/tabs/RelationsTab"));
const RiskTab = dynamic(() => import("../_components/tabs/RiskTab"));

const TABS = [
  { label: "مرور کلی", Component: OverviewTab },
  { label: "عکس‌ها", Component: ImagesTab },
  { label: "فعالیت", Component: ActivityTab },
  { label: "مالی", Component: FinancialTab },
  { label: "گزارش‌ها", Component: ReportsTab },
  { label: "روابط", Component: RelationsTab },
  { label: "Risk & AI", Component: RiskTab },
];

function User360Page() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id);
  const { data, isLoading, error } = useUser360(userId);

  if (isLoading) return <Skeleton className="h-96" />;
  if (error || !data?.profile) return <ErrorState message="خطا در بارگذاری" />;

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.profile.nickname}</h1>
          <p className="text-sm text-gray-500">ID: {userId}</p>
        </div>
        {/* Trust badge سریع */}
        {data.trust && (
          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            Trust: {data.trust.score ?? "—"}
          </span>
        )}
        {/* Badges */}
        {Array.isArray(data.badges) &&
          data.badges.map((b: any) => (
            <span
              key={b.type}
              className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800"
            >
              🏅 {b.type}
            </span>
          ))}
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1 flex-wrap gap-y-1">
          {TABS.map(({ label }) => (
            <Tab
              key={label}
              className={({ selected }) =>
                `rounded-lg py-2 px-3 text-sm font-medium leading-5 transition ${
                  selected
                    ? "bg-white dark:bg-gray-800 shadow text-blue-600"
                    : "text-gray-500 hover:bg-white/40"
                }`
              }
            >
              {label}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4">
          {TABS.map(({ label, Component }) => (
            <Tab.Panel key={label}>
              {/* data از 360 endpoint پاس می‌شه؛ هر تب خودش هم می‌تونه fetch کنه */}
              <Component userId={userId} data360={data} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default withPageProtection(User360Page, {
  panelPermission: "view_safety_panel",
  itemPermissions: "manage_users",
});
