"use client";

import { useEffect, useState } from "react";
import {
  AiPackId,
  AiPackJob,
  AiPackStatus,
  useAiPackControlAction,
  useAiPackControlStatus,
  useAiPackJob,
} from "@/lib/api/exec/mutations/useAiPackControl";

const PACKS: Array<{ id: AiPackId; title: string; description: string }> = [
  { id: "seo-pack", title: "SEO", description: "سئو، AEO، بک‌لینک و پیشنهاددهنده" },
  { id: "revenue-pack", title: "Revenue", description: "درآمد، Monetization، Uplift و Feedback" },
  { id: "matching-pack", title: "Matching", description: "Embedding، شخصیت‌شناسی، دستیار و پشتیبانی" },
  { id: "safety-pack", title: "Safety", description: "مودریشن، تأیید چهره و تحلیل تصویر" },
];

const STATUS: Record<string, { label: string; className: string }> = {
  running: { label: "در حال اجرا", className: "bg-emerald-500/10 text-emerald-600" },
  stopped: { label: "متوقف", className: "bg-gray-500/10 text-gray-500" },
  partial: { label: "اجرای ناقص", className: "bg-amber-500/10 text-amber-600" },
  not_installed: { label: "نصب نشده", className: "bg-gray-500/10 text-gray-500" },
};

function mb(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? (value / 1024).toFixed(2) + " GB"
    : "—";
}

function gatewayLabel(gateway?: AiPackStatus["gateway"]) {
  const status = gateway?.status;
  if (status === "healthy") return "Gateway سالم";
  if (status === "degraded") return "Gateway ناپایدار";
  if (status === "unavailable" || status === "unreachable") return "Gateway در دسترس نیست";
  if (status === "stopped") return "Gateway متوقف";
  return "وضعیت Gateway نامشخص";
}

function TestSummary({ job }: { job: AiPackJob }) {
  const packs = Array.isArray(job.result?.packs) ? job.result.packs : null;
  if (packs) {
    return (
      <div className="space-y-3">
        {packs.map((item: any) => (
          <div key={item.pack} className="space-y-1 border-b border-gray-200/60 dark:border-gray-700/60 pb-2 last:border-0">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{item.pack}</span>
              <span className="text-gray-500">
                {item.state === "skipped_not_installed" ? "نصب نشده" :
                 item.state === "not_started" ? "شروع نشد" :
                 item.test?.ok ? "تست موفق" : "تست ناموفق"}
              </span>
              {typeof item.minimum_available_during_operation_mb === "number" && (
                <span className="text-xs text-gray-500">
                  حداقل RAM آزاد: {item.minimum_available_during_operation_mb} MB
                </span>
              )}
            </div>
            {item.test?.seo_external_egress && (
              <p className="text-xs text-sky-700 dark:text-sky-300">
                خروج اینترنت SEO: {item.test.seo_external_egress === "external_url_fetch_passed"
                  ? "دسترسی به URL خارجی موفق بود"
                  : "URL خارجی در دسترس نبود؛ VPN، فایروال یا DNS خروجی باید بررسی شود"}
              </p>
            )}
            {Array.isArray(item.test?.tests) && item.test.tests.map((test: any, index: number) => (
              <div key={index} className="flex justify-between gap-3 text-xs">
                <span>{test.test}</span>
                <span className={test.status === "PASS" ? "text-emerald-600" : "text-red-500"}>
                  {test.status === "PASS" ? "موفق" : "ناموفق"}
                </span>
              </div>
            ))}
            {item.test?.revenue_model_readiness && Object.entries(item.test.revenue_model_readiness).map(([name, readiness]: [string, any]) => (
              <p key={name} className="text-xs text-gray-500">
                {name}: model_trained={String(readiness.model_trained ?? "unknown")}, cv_score={String(readiness.cv_score ?? "unknown")}
              </p>
            ))}
            {typeof item.memory_after?.available_mb === "number" && (
              <p className="text-xs text-gray-500">RAM آزاد بعد از تست: {item.memory_after.available_mb} MB</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  const tests = job.result?.test?.tests ?? job.result?.tests;
  if (Array.isArray(tests)) {
    return (
      <div className="space-y-1">
        {tests.map((test: any, index: number) => (
          <div key={index} className="flex justify-between gap-3 text-sm">
            <span>{test.test}</span>
            <span className={test.status === "PASS" ? "text-emerald-600" : "text-red-500"}>
              {test.status === "PASS" ? "موفق" : "ناموفق"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (job.result?.ok === false && job.result?.reason) {
    return <p className="text-sm text-amber-600">{job.result.reason}</p>;
  }
  return <p className="text-sm text-gray-500">خلاصهٔ نتیجه در گزارش عملیات ذخیره شده است.</p>;
}

export default function AiPackControlPanel() {
  const statusQuery = useAiPackControlStatus();
  const action = useAiPackControlAction();
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const jobQuery = useAiPackJob(jobId);
  const status = statusQuery.data;
  const job = jobQuery.data;
  const refreshStatus = statusQuery.refetch;

  useEffect(() => {
    if (job?.state === "completed" || job?.state === "failed") {
      refreshStatus();
    }
  }, [job?.state, refreshStatus]);

  const operationActive = action.isPending || Boolean(job && (job.state === "queued" || job.state === "running"));
  const totalRam = status?.memory?.total_mb;
  const availableRam = status?.memory?.available_mb;
  const usedPercent = totalRam && typeof availableRam === "number"
    ? Math.max(0, Math.min(100, ((totalRam - availableRam) / totalRam) * 100))
    : null;

  async function submit(input:
    | { kind: "pack"; pack: AiPackId; action: "start" | "stop" | "test" }
    | { kind: "progressive" }
    | { kind: "stop-all" }
  ) {
    setMessage(null);
    try {
      const result = await action.mutateAsync(input);
      if (typeof result?.job_id === "string") setJobId(result.job_id);
      statusQuery.refetch();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.response?.data?.error || "اجرای عملیات ناموفق بود.");
    }
  }

  async function stopAll() {
    if (!window.confirm("فقط چهار پروژهٔ AI متوقف می‌شوند. Backend، دیتابیس‌ها، پنل ادمین و Nginx دست‌نخورده می‌مانند. ادامه می‌دهی؟")) return;
    await submit({ kind: "stop-all" });
  }

  if (statusQuery.isLoading) {
    return <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-sm text-gray-500">در حال دریافت وضعیت پک‌های هوش مصنوعی…</div>;
  }

  if (statusQuery.isError || !status) {
    return (
      <div className="rounded-xl border border-amber-300/60 bg-amber-500/5 p-5 space-y-2">
        <h3 className="font-bold">کنترل پک‌های هوش مصنوعی در دسترس نیست</h3>
        <p className="text-sm text-gray-500">احتمالاً کنترل‌کنندهٔ محدود روی VPS نصب نشده یا Backend هنوز با تنظیمات جدید Deploy نشده است.</p>
        <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => statusQuery.refetch()}>تلاش مجدد</button>
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">کنترل و آزمایش AI Packs</h3>
          <p className="text-sm text-gray-500">راه‌اندازی مرحله‌ای، تست واقعی Gateway و پایش حافظهٔ VPS</p>
        </div>
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={operationActive || !Object.values(status.packs).some((p) => p.ready_to_start || p.state === "running" || p.state === "partial")}
          onClick={() => submit({ kind: "progressive" })}
        >
          {operationActive ? "عملیات در حال اجرا…" : "تست ترتیبی همهٔ پک‌ها"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-500/5 p-3">
          <p className="text-xs text-gray-500">RAM کل</p>
          <p className="text-xl font-bold">{mb(totalRam)}</p>
        </div>
        <div className="rounded-lg bg-gray-500/5 p-3">
          <p className="text-xs text-gray-500">RAM قابل‌استفاده</p>
          <p className="text-xl font-bold">{mb(availableRam)}</p>
        </div>
        <div className="rounded-lg bg-gray-500/5 p-3">
          <p className="text-xs text-gray-500">مصرف تقریبی میزبان</p>
          <p className="text-xl font-bold">{usedPercent === null ? "—" : usedPercent.toFixed(1) + "%"}</p>
        </div>
      </div>

      {usedPercent !== null && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className={"h-full rounded-full " + (usedPercent >= 85 ? "bg-red-500" : usedPercent >= 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: usedPercent + "%" }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PACKS.map((pack) => {
          const item = status.packs?.[pack.id];
          const state = item?.state ?? "not_installed";
          const badge = STATUS[state] ?? { label: "وضعیت نامشخص", className: "bg-gray-500/10 text-gray-500" };
          const busy = operationActive;
          return (
            <div key={pack.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold">{pack.title} Pack</h4>
                  <p className="text-xs text-gray-500 mt-1">{pack.description}</p>
                </div>
                <span className={"whitespace-nowrap rounded-full px-2.5 py-1 text-xs " + badge.className}>{badge.label}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>کانتینرهای فعال: {item?.running_containers ?? 0}</span>
                <span>{gatewayLabel(item?.gateway)}</span>
              </div>
              {item?.preflight_reason && state !== "not_installed" && (
                <p className="text-xs text-amber-600">{item.preflight_reason}</p>
              )}
              {state === "not_installed" && (
                <p className="text-xs text-gray-500">این پک هنوز روی VPS نصب یا آمادهٔ اجرا نیست.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  disabled={busy || !item?.ready_to_start}
                  onClick={() => submit({ kind: "pack", pack: pack.id, action: "start" })}
                >شروع</button>
                <button
                  className="rounded-lg border border-sky-500/50 px-3 py-2 text-xs disabled:opacity-40"
                  disabled={busy || state !== "running"}
                  onClick={() => submit({ kind: "pack", pack: pack.id, action: "test" })}
                >تست واقعی</button>
                <button
                  className="rounded-lg border border-red-500/50 px-3 py-2 text-xs text-red-600 disabled:opacity-40"
                  disabled={busy || (state !== "running" && state !== "partial")}
                  onClick={() => submit({ kind: "pack", pack: pack.id, action: "stop" })}
                >توقف</button>
              </div>
              {item?.memory?.length > 0 && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer">مصرف RAM کانتینرهای این پک</summary>
                  <div className="mt-2 space-y-1">
                    {item.memory.map((m) => <div key={m.container} className="flex justify-between gap-3"><span>{m.container.replace(/^yarsalam-[^-]+-pack-/, "")}</span><span>{m.usage}</span></div>)}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
        <p className="text-xs text-gray-500">توقف سراسری فقط چهار پروژهٔ AI را هدف می‌گیرد؛ Backend، دیتابیس، پنل و Nginx در فهرست مجاز نیستند.</p>
        <button
          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-40"
          disabled={operationActive}
          onClick={stopAll}
        >توقف همهٔ پک‌های AI</button>
      </div>

      {message && <div role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600">{message}</div>}

      {job && (
        <div className="rounded-lg bg-gray-500/5 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm">آخرین عملیات</strong>
            <span className="text-xs text-gray-500">{job.state === "completed" ? "تکمیل شد" : job.state === "failed" ? "ناموفق" : job.state === "queued" ? "در صف" : "در حال اجرا"}</span>
          </div>
          <p className="text-xs text-gray-500">{job.step}</p>
          <p className="text-xs text-gray-500">کمترین RAM آزاد حین عملیات: {typeof job.min_available_mb === "number" ? job.min_available_mb + " MB" : "—"}</p>
          {job.error && <p className="text-sm text-red-600">{job.error}</p>}
          {job.state === "completed" && <TestSummary job={job} />}
        </div>
      )}

      <p className="text-xs text-gray-400">آخرین به‌روزرسانی وضعیت: {new Date(status.timestamp).toLocaleTimeString("fa-IR")}. تست SEO نیازمند دسترسی خروجی به اینترنت است؛ نتیجهٔ آن مشخص می‌کند مسیر خروجی فعلی VPS برای ممیزی URL کافی است یا نه.</p>
    </section>
  );
}
