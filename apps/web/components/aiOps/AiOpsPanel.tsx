"use client";

import {
  useAiOpsOverview,
  ServiceStatus,
  PerformanceIssue,
} from "@/lib/api/exec/mutations/useAiOps";

// ───────────────────────── helpers ──────────────────────────

function StatusBadge({ status }: { status: ServiceStatus | undefined }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<ServiceStatus, { label: string; cls: string }> = {
    healthy: { label: "سالم", cls: "bg-green-100 text-green-800" },
    degraded: { label: "تنزل‌یافته", cls: "bg-yellow-100 text-yellow-800" },
    down: { label: "خارج از دسترس", cls: "bg-red-100 text-red-800" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}
    >
      {label}
    </span>
  );
}

function MetricRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  unit?: string;
}) {
  const display =
    value === null || value === undefined ? (
      <span className="text-gray-400 text-xs">داده در دسترس نیست</span>
    ) : typeof value === "boolean" ? (
      value ? (
        <span className="text-green-600 text-xs font-medium">بله</span>
      ) : (
        <span className="text-red-500 text-xs font-medium">خیر</span>
      )
    ) : (
      <span className="text-gray-900 font-medium text-sm">
        {value}
        {unit ? (
          <span className="text-gray-400 font-normal mr-0.5 text-xs">
            {unit}
          </span>
        ) : null}
      </span>
    );

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      {display}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  status,
  dataAvailable,
  children,
}: {
  title: string;
  icon: string;
  status?: ServiceStatus;
  dataAvailable: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {!dataAvailable && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
              آفلاین
            </span>
          )}
          {status && <StatusBadge status={status} />}
        </div>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function UsageBar({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const pct = Math.min(100, Math.max(0, percent));
  const color =
    pct > 90 ? "bg-red-500" : pct > 75 ? "bg-yellow-400" : "bg-green-400";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function IssueBadge({ severity }: { severity: "warning" | "critical" }) {
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        severity === "critical"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {severity === "critical" ? "بحرانی" : "هشدار"}
    </span>
  );
}

// ───────────────────────── main ──────────────────────────

export default function AiOpsPanel() {
  const { data, isLoading, isError, dataUpdatedAt } = useAiOpsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        خطا در دریافت داده‌های مانیتورینگ. لطفاً صفحه را رفرش کنید.
      </div>
    );
  }

  const {
    redis,
    embeddedAi,
    mlService,
    uplift,
    system,
    llmCost,
    performanceIssues,
  } = data;

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("fa-IR")
    : null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* header meta */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          آخرین به‌روزرسانی:{" "}
          {new Date(data.generatedAt).toLocaleString("fa-IR")}
        </span>
        {updatedAt && <span>آخرین fetch: {updatedAt}</span>}
      </div>

      {/* ── performance issues banner ── */}
      {performanceIssues.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
          <p className="text-sm font-medium text-red-700">
            {performanceIssues.length} مشکل عملکردی شناسایی شد
          </p>
          <div className="space-y-2">
            {performanceIssues.map((issue, i) => (
              <IssueRow key={i} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── system resources ── */}
      {system.dataAvailable && (
        <SectionCard
          title="منابع سیستم"
          icon="🖥️"
          dataAvailable={system.dataAvailable}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {system.cpu && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">CPU</span>
                  <span className="text-xs font-medium">
                    {system.cpu.average.toFixed(1)}%
                  </span>
                </div>
                <UsageBar percent={system.cpu.average} />
                <p className="text-xs text-gray-400 mt-1">
                  {system.cpu.count} هسته
                </p>
              </div>
            )}
            {system.memory && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">حافظه</span>
                  <span className="text-xs font-medium">
                    {system.memory.usedGb.toFixed(1)} /{" "}
                    {system.memory.totalGb.toFixed(1)} GB
                  </span>
                </div>
                <UsageBar percent={system.memory.percent} />
              </div>
            )}
            {system.disk && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">دیسک</span>
                  <span className="text-xs font-medium">
                    {system.disk.usedGb.toFixed(1)} /{" "}
                    {system.disk.totalGb.toFixed(1)} GB
                  </span>
                </div>
                <UsageBar percent={system.disk.percent} />
              </div>
            )}
          </div>
          {system.app && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat
                label="میانگین زمان پاسخ"
                value={
                  system.app.avgResponseTime != null
                    ? `${system.app.avgResponseTime.toFixed(0)} ms`
                    : null
                }
              />
              <MiniStat
                label="نرخ خطا"
                value={
                  system.app.errorRate != null
                    ? `${(system.app.errorRate * 100).toFixed(2)}%`
                    : null
                }
              />
              <MiniStat
                label="دسترس‌پذیر"
                value={system.app.isAvailable ? "بله" : "خیر"}
                colored={system.app.isAvailable}
              />
              {system.app.sampleSize != null && (
                <MiniStat
                  label="نمونه‌ها"
                  value={String(system.app.sampleSize)}
                />
              )}
            </div>
          )}
          {system.collectedAt && (
            <p className="text-xs text-gray-300 mt-2">
              جمع‌آوری:{" "}
              {new Date(system.collectedAt).toLocaleTimeString("fa-IR")}
            </p>
          )}
        </SectionCard>
      )}

      {/* ── service cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Redis */}
        <SectionCard
          title="Redis / Vector Store"
          icon="🗄️"
          dataAvailable={redis.dataAvailable}
        >
          <MetricRow label="تعداد بردارها" value={redis.vectorCount} />
          <MetricRow label="حافظه مصرفی" value={redis.memoryUsedMb} unit="MB" />
          <MetricRow
            label="حافظه حداکثر"
            value={redis.memoryPeakMb}
            unit="MB"
          />
          <MetricRow label="نرخ Cache Hit" value={redis.hitRate} unit="%" />
          <MetricRow label="کلیدهای تخلیه‌شده" value={redis.evictedKeys} />
        </SectionCard>

        {/* Embedded AI */}
        <SectionCard
          title="سرویس Embedding"
          icon="🤖"
          status={embeddedAi.dataAvailable ? embeddedAi.status : "down"}
          dataAvailable={embeddedAi.dataAvailable}
        >
          <MetricRow label="مدل بارگذاری‌شده" value={embeddedAi.modelLoaded} />
          <MetricRow label="اتصال Redis" value={embeddedAi.redisOk} />
          <MetricRow label="صف embedding" value={embeddedAi.queueLength} />
          {embeddedAi.uptime && (
            <MetricRow label="آپتایم" value={embeddedAi.uptime} />
          )}
          {embeddedAi.avgEmbeddingLatency && (
            <MetricRow
              label="میانگین تأخیر embedding"
              value={embeddedAi.avgEmbeddingLatency}
            />
          )}
          {!embeddedAi.uptime &&
            !embeddedAi.avgEmbeddingLatency &&
            embeddedAi.dataAvailable && (
              <p className="text-xs text-gray-400 mt-1 italic">
                uptime و latency هنوز از /health سرویس ارائه نمی‌شوند
              </p>
            )}
        </SectionCard>

        {/* ML Service */}
        <SectionCard
          title="سرویس ML Matching"
          icon="🧠"
          status={mlService.dataAvailable ? mlService.status : "down"}
          dataAvailable={mlService.dataAvailable}
        >
          <MetricRow
            label="رویدادهای آموزش (stream)"
            value={mlService.trainingEventCount}
          />
          {mlService.matchingJobsPerHour !== null ? (
            <MetricRow
              label="jobs تطابق / ساعت"
              value={mlService.matchingJobsPerHour}
            />
          ) : (
            <MetricRow label="jobs تطابق / ساعت" value={null} />
          )}
          {mlService.avgMatchingLatency !== null ? (
            <MetricRow
              label="میانگین تأخیر matching"
              value={mlService.avgMatchingLatency}
            />
          ) : (
            <MetricRow label="میانگین تأخیر matching" value={null} />
          )}
          {mlService.failedJobs !== null ? (
            <MetricRow label="jobs ناموفق" value={mlService.failedJobs} />
          ) : (
            <MetricRow label="jobs ناموفق" value={null} />
          )}
          {mlService.dataAvailable &&
            mlService.matchingJobsPerHour === null &&
            mlService.avgMatchingLatency === null && (
              <p className="text-xs text-gray-400 mt-1 italic">
                ml_service هنوز این متریک‌ها را از /health ارائه نمی‌دهد
              </p>
            )}
        </SectionCard>

        {/* Uplift */}
        <SectionCard
          title="Campaign Uplift"
          icon="📈"
          status={uplift.dataAvailable ? uplift.status : "down"}
          dataAvailable={uplift.dataAvailable}
        >
          <MetricRow label="مدل آموزش‌دیده" value={uplift.modelTrained} />
          {uplift.lastTrainingAt !== null ? (
            <MetricRow
              label="آخرین آموزش"
              value={new Date(uplift.lastTrainingAt).toLocaleDateString(
                "fa-IR",
              )}
            />
          ) : (
            <MetricRow label="آخرین آموزش" value={null} />
          )}
          {uplift.confidenceScore !== null ? (
            <MetricRow
              label="امتیاز اطمینان"
              value={`${(uplift.confidenceScore * 100).toFixed(1)}%`}
            />
          ) : (
            <MetricRow label="امتیاز اطمینان" value={null} />
          )}
          {uplift.dataAvailable &&
            uplift.lastTrainingAt === null &&
            uplift.confidenceScore === null && (
              <p className="text-xs text-gray-400 mt-1 italic">
                سرویس uplift هنوز last_training_at و confidence_score را ارائه
                نمی‌دهد
              </p>
            )}
        </SectionCard>

        {/* LLM Cost */}
        <SectionCard
          title="هزینه LLM"
          icon="💰"
          dataAvailable={llmCost.dataAvailable}
        >
          <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
            <span className="text-2xl">🚫</span>
            <p className="text-xs text-gray-500 max-w-[180px]">
              زیرساخت رصد هزینه LLM در پروژه پیاده‌سازی نشده است
            </p>
            <p className="text-xs text-gray-400 mt-1">
              برای فعال‌سازی به LangFuse یا Helicone متصل شوید
            </p>
          </div>
        </SectionCard>

        {/* System (mini if data unavailable) */}
        {!system.dataAvailable && (
          <SectionCard title="منابع سیستم" icon="🖥️" dataAvailable={false}>
            <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
              <span className="text-2xl">📡</span>
              <p className="text-xs text-gray-500">
                سرویس ai_ops در دسترس نیست
              </p>
              <p className="text-xs text-gray-400">AI_OPS_URL را بررسی کنید</p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── sub-components ──────────────────────────

function MiniStat({
  label,
  value,
  colored,
}: {
  label: string;
  value: string | null;
  colored?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span
        className={`text-sm font-medium ${
          colored === true
            ? "text-green-600"
            : colored === false
              ? "text-red-500"
              : "text-gray-800"
        }`}
      >
        {value ?? <span className="text-gray-300 font-normal text-xs">—</span>}
      </span>
    </div>
  );
}

function IssueRow({ issue }: { issue: PerformanceIssue }) {
  return (
    <div className="bg-white rounded-lg border border-red-100 p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{issue.type}</span>
        <IssueBadge severity={issue.severity} />
      </div>
      <p className="text-xs text-gray-500">{issue.impact}</p>
      <p className="text-xs text-blue-600">{issue.suggestion}</p>
      <div className="flex items-center gap-4 mt-0.5">
        {issue.estimatedDailyLoss != null && (
          <span className="text-xs text-red-500">
            خسارت روزانه: {issue.estimatedDailyLoss.toLocaleString()} تومان
          </span>
        )}
        <span className="text-xs text-gray-400">
          مقدار: {issue.value} / حد: {issue.threshold}
        </span>
      </div>
    </div>
  );
}
