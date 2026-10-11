"use client";
import { withPageProtection } from "@/components/withPageProtection";
import GlobalText from "@/components/ui/GlobalText";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, MiniStat } from "@/components/ui/shared";
import ServiceHealthGrid from "@/components/ServiceHealthGrid";
import {
  useSystemHealthOverview,
  useServicesStatus,
} from "@/lib/api/exec/mutations/useSystemHealth";

// 🔧 آستانه‌ها دقیقاً همون settings.THRESHOLDS در ai_ops/config/settings.py است
function metricColor(percent: number, warn: number, crit: number) {
  if (percent >= crit) return "#EF4444";
  if (percent >= warn) return "#F59E0B";
  return "#00D4AA";
}

function ResourceRing({
  label,
  percent,
  warn,
  crit,
  detail,
}: {
  label: string;
  percent: number;
  warn: number;
  crit: number;
  detail: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = metricColor(percent, warn, crit);

  return (
    <Card className="p-4 flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="dark:stroke-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s ease, stroke 0.8s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>
            {Math.round(percent)}٪
          </span>
        </div>
      </div>
      <GlobalText className="text-sm font-bold">{label}</GlobalText>
      <GlobalText className="text-xs text-gray-400">{detail}</GlobalText>
    </Card>
  );
}

function IssuesList({ issues }: { issues: any[] }) {
  if (!issues || issues.length === 0) {
    return (
      <Card className="p-6 text-center">
        <GlobalText className="text-gray-400">
          هیچ مشکل فعالی شناسایی نشده — سیستم سالم است.
        </GlobalText>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {issues.map((issue, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  issue.severity === "critical"
                    ? "bg-red-500/15 text-red-500"
                    : "bg-amber-500/15 text-amber-500"
                }`}
              >
                {issue.severity === "critical" ? "بحرانی" : "هشدار"}
              </span>
              <GlobalText className="font-bold mt-1">{issue.impact}</GlobalText>
              <GlobalText className="text-sm text-gray-400 mt-1">
                {issue.suggestion}
              </GlobalText>
            </div>
            {issue.revenue_impact > 0 && (
              <div className="text-left shrink-0">
                <div className="text-xs text-gray-500">زیان روزانه تخمینی</div>
                <div className="text-sm font-bold text-red-400">
                  ${(issue.revenue_impact * 100).toFixed(0)}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SystemHealthPage() {
  const { data: overview, isLoading: overviewLoading } =
    useSystemHealthOverview();
  const { data: services, isLoading: servicesLoading } = useServicesStatus();

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>سلامت سیستم</SectionTitle>
        {overview && !overview.dataAvailable && (
          <div className="mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <GlobalText className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ اتصال به ai_ops برقرار نشد — داده‌ی این صفحه ممکن است قدیمی یا
              ناقص باشد
            </GlobalText>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading || !overview?.system ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : (
          <>
            <ResourceRing
              label="CPU"
              percent={overview.system.cpu.average}
              warn={70}
              crit={85}
              detail={`${overview.system.cpu.count} هسته`}
            />
            <ResourceRing
              label="RAM"
              percent={overview.system.memory.percent}
              warn={75}
              crit={90}
              detail={`${overview.system.memory.used_gb} از ${overview.system.memory.total_gb} گیگ`}
            />
            <ResourceRing
              label="دیسک"
              percent={overview.system.disk.percent}
              warn={80}
              crit={95}
              detail={`${overview.system.disk.used_gb} از ${overview.system.disk.total_gb} گیگ`}
            />
            <MiniStat
              label={
                overview.app.is_available
                  ? "میانگین زمان پاسخ"
                  : "زمان پاسخ (در دسترس نیست)"
              }
              value={
                overview.app.is_available
                  ? `${overview.app.avg_response_time} ms`
                  : "—"
              }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionTitle>مشکلات شناسایی‌شده</SectionTitle>
          {overviewLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <IssuesList issues={overview?.issues ?? []} />
          )}
        </div>
        <div>
          <SectionTitle>وضعیت سرویس‌ها</SectionTitle>
          <ServiceHealthGrid services={services} isLoading={servicesLoading} />
        </div>
      </div>

      {overview?.lastUpdated && (
        <GlobalText className="text-xs text-gray-400 text-left">
          آخرین به‌روزرسانی:{" "}
          {new Date(overview.lastUpdated).toLocaleTimeString("fa-IR")}
        </GlobalText>
      )}
    </div>
  );
}

export default withPageProtection(SystemHealthPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
