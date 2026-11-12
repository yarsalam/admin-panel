"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchAcquisition, fetchContentIdeas } from "@/lib/api/growth/queries/useSeoStudio";

type Retention = { eligibleUsers: number; retainedUsers: number; rate: number | null };
type Channel = {
  source: string;
  registrations: number;
  completedProfiles: number;
  activationEligibleUsers: number;
  firstWeekActivatedUsers: number;
  profileCompletionRate: number | null;
  firstWeekActivationRate: number | null;
  retentionD7: Retention;
  retentionD30: Retention;
};
type Report = {
  totals: {
    registrations: number;
    completedProfiles: number;
    verifiedUsers: number;
    firstWeekActivatedUsers: number;
    profileCompletionRate: number | null;
    firstWeekActivationRate: number | null;
  };
  channels: Channel[];
  paidRevenue: Array<{
    source: string;
    currency: string;
    paidTransactions: number;
    payingUsers: number;
    amountMinorUnits: string;
  }>;
  cac: { value: number | null; reason: string };
};
type Idea = {
  id: string;
  title: string;
  capabilityStatus: "partial" | "not_implemented";
  promotionAllowed: boolean;
  evidenceRequired: string[];
};

const fmt = (value: number | null | undefined) =>
  value == null ? "—" : new Intl.NumberFormat("fa-IR").format(value);
const pct = (value: number | null | undefined) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("fa-IR", { style: "percent", maximumFractionDigits: 1 }).format(value);
const label = (source: string) => source === "unknown" ? "نامشخص" : source;

function SeoStudioPage() {
  const [days, setDays] = useState(30);
  const reportQuery = useQuery<Report>({
    queryKey: ["growth", "acquisition", days],
    queryFn: () => fetchAcquisition(days),
  });
  const ideasQuery = useQuery<Idea[]>({
    queryKey: ["growth", "ai-product-pillars"],
    queryFn: fetchContentIdeas,
  });
  const report = reportQuery.data;
  const ideas = ideasQuery.data ?? [];

  return (
    <div className="space-y-7 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionTitle>موتور رشد و جذب یارسلام</SectionTitle>
          <p className="mt-1 text-sm text-gray-500">
            سنجش جذب کاربر باکیفیت؛ نه رتبه کلمات، امتیاز سئو یا پیش‌بینی ترافیک.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span>بازه گزارش</span>
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value={7}>۷ روز</option>
            <option value={30}>۳۰ روز</option>
            <option value={90}>۹۰ روز</option>
          </select>
        </label>
      </div>

      {reportQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)}
        </div>
      ) : reportQuery.isError ? (
        <div role="alert" className="rounded-lg border border-red-300 p-4 text-sm text-red-700 dark:border-red-800 dark:text-red-300">
          گزارش جذب دریافت نشد. ارتباط API یا پایگاه داده را بررسی کنید.
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { title: "ثبت‌نام", value: report.totals.registrations },
              { title: "تکمیل پروفایل", value: report.totals.completedProfiles },
              { title: "تأییدشده", value: report.totals.verifiedUsers },
              { title: "فعال‌سازی ۷روزه", value: report.totals.firstWeekActivatedUsers },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500">{item.title}</p>
                <p className="mt-2 text-2xl font-bold">{fmt(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70">
              <p className="text-xs text-gray-500">نرخ تکمیل پروفایل</p>
              <p className="mt-1 text-xl font-semibold">{pct(report.totals.profileCompletionRate)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70">
              <p className="text-xs text-gray-500">نرخ فعال‌سازی گروه بالغ ۷روزه</p>
              <p className="mt-1 text-xl font-semibold">{pct(report.totals.firstWeekActivationRate)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70">
              <p className="text-xs text-gray-500">CAC</p>
              <p className="mt-1 text-xl font-semibold">ناموجود</p>
              <p className="mt-1 text-xs text-gray-500">{report.cac.reason}</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">عملکرد کانال‌های جذب</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-[850px] w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["منبع", "ثبت‌نام", "تکمیل پروفایل", "فعال‌سازی", "نرخ فعال‌سازی", "ماندگاری روز ۷", "ماندگاری روز ۳۰"].map((header) => (
                      <th key={header} className="px-3 py-3 text-right font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.channels.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">در این بازه کانال قابل گزارش وجود ندارد.</td></tr>
                  ) : report.channels.map((channel) => (
                    <tr key={channel.source} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-3 font-medium">{label(channel.source)}</td>
                      <td className="px-3 py-3">{fmt(channel.registrations)}</td>
                      <td className="px-3 py-3">{fmt(channel.completedProfiles)} ({pct(channel.profileCompletionRate)})</td>
                      <td className="px-3 py-3">{fmt(channel.firstWeekActivatedUsers)} / {fmt(channel.activationEligibleUsers)}</td>
                      <td className="px-3 py-3">{pct(channel.firstWeekActivationRate)}</td>
                      <td className="px-3 py-3">{fmt(channel.retentionD7.retainedUsers)} / {fmt(channel.retentionD7.eligibleUsers)} ({pct(channel.retentionD7.rate)})</td>
                      <td className="px-3 py-3">{fmt(channel.retentionD30.retainedUsers)} / {fmt(channel.retentionD30.eligibleUsers)} ({pct(channel.retentionD30.rate)})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              منبع نامشخص به‌صورت جدا نمایش داده می‌شود؛ فعال‌سازی و ماندگاری فقط برای گروه‌های زمانی بالغ محاسبه شده‌اند.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">پرداخت‌های موفق به تفکیک منبع و ارز</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-[560px] w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["منبع", "ارز", "تراکنش", "پرداخت‌کننده", "مبلغ در واحد ذخیره‌سازی"].map((header) => (
                      <th key={header} className="px-3 py-3 text-right font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.paidRevenue.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">پرداخت موفقی در این بازه ثبت نشده است.</td></tr>
                  ) : report.paidRevenue.map((row) => (
                    <tr key={row.source + ":" + row.currency} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-3">{label(row.source)}</td>
                      <td className="px-3 py-3">{row.currency}</td>
                      <td className="px-3 py-3">{fmt(row.paidTransactions)}</td>
                      <td className="px-3 py-3">{fmt(row.payingUsers)}</td>
                      <td className="px-3 py-3 font-mono">{row.amountMinorUnits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">مبالغ با واحد ذخیره‌شده در Payment نمایش داده می‌شوند و ارزها با یکدیگر جمع نشده‌اند.</p>
          </section>
        </>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">محورهای محتوایی فناوری یارسلام</h2>
          <p className="text-sm text-gray-500">
            این موضوعات با قابلیت‌های واقعی یا درحال‌توسعه محصول هم‌راستا هستند؛ تبلیغ تا زمان ثبت شواهد پذیرش غیرفعال می‌ماند.
          </p>
        </div>
        {ideasQuery.isLoading ? <Skeleton className="h-40" /> : ideasQuery.isError ? (
          <p role="alert" className="text-sm text-red-600">فهرست محورهای محتوایی دریافت نشد.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {ideas.map((idea) => (
              <article key={idea.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="mt-2 text-xs text-gray-500">
                  {idea.capabilityStatus === "partial" ? "نیازمند تکمیل و آزمون" : "هنوز پیاده‌سازی نشده"}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  {idea.promotionAllowed ? "مجاز برای تبلیغ" : "تبلیغ تا اثبات end-to-end غیرفعال است"}
                </p>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer">شواهد لازم برای پذیرش ({idea.evidenceRequired.length})</summary>
                  <ul className="mt-2 list-disc space-y-1 pr-5 text-gray-600 dark:text-gray-300">
                    {idea.evidenceRequired.map((evidence) => <li key={evidence}>{evidence}</li>)}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default withPageProtection(SeoStudioPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
