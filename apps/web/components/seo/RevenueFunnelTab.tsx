"use client";
import GlobalText from "@/components/ui/GlobalText";
import { Skeleton } from "@/components/ui/Skeleton";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  useSeoRevenueAttribution,
  useSeoFunnel,
  useSeoTrendsMoM,
} from "@/lib/api/exec/mutations/useSeo";
import { Card } from "../ui/shared";

function MoMBadge({ deltaPercent }: { deltaPercent: number | null }) {
  if (deltaPercent === null)
    return (
      <span className="text-xs text-gray-400">
        بدون داده‌ی قبلی برای مقایسه
      </span>
    );
  const up = deltaPercent >= 0;
  return (
    <span
      className={`text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}
    >
      {up ? "↑" : "↓"} {Math.abs(deltaPercent)}٪ نسبت به ماه قبل
    </span>
  );
}

function FunnelBar({
  steps,
}: {
  steps: { step: string; label: string; count: number | null }[];
}) {
  const known = steps.filter((s) => typeof s.count === "number") as {
    step: string;
    label: string;
    count: number;
  }[];
  const max = known[0]?.count || 1;
  return (
    <div className="space-y-3">
      {steps.map((s) => {
        const hasCount = typeof s.count === "number";
        const pct = hasCount
          ? Math.round(((s.count as number) / max) * 100)
          : 0;
        return (
          <div key={s.step}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{s.label}</span>
              <span className="font-medium">
                {hasCount ? s.count!.toLocaleString("fa-IR") : "نامشخص"}
              </span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              {hasCount && (
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RevenueAttributionTable({ rows }: { rows: any[] }) {
  if (!rows || rows.length === 0) {
    return (
      <GlobalText className="text-sm text-gray-400 py-6 text-center block">
        داده‌ای برای انتساب درآمد یافت نشد
      </GlobalText>
    );
  }
  const first = rows[0];
  const sourceKey =
    ["source", "channel", "name", "acquisitionSource"].find(
      (k) => typeof first[k] === "string",
    ) ?? Object.keys(first)[0];
  const ltvKey = ["ltv", "avgLtv", "averageLtv"].find(
    (k) => typeof first[k] === "number",
  );
  const revenueKey = ["revenue", "totalRevenue"].find(
    (k) => typeof first[k] === "number",
  );
  const usersKey = ["users", "count", "userCount"].find(
    (k) => typeof first[k] === "number",
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
              منبع
            </th>
            {ltvKey && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                LTV
              </th>
            )}
            {usersKey && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                کاربران
              </th>
            )}
            {revenueKey && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                درآمد
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                {String(row[sourceKey])}
              </td>
              {ltvKey && (
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  ${Number(row[ltvKey]).toFixed(0)}
                </td>
              )}
              {usersKey && (
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                  {Number(row[usersKey]).toLocaleString("fa-IR")}
                </td>
              )}
              {revenueKey && (
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                  ${Number(row[revenueKey]).toFixed(0)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RevenueFunnelTab() {
  const { data: attribution = [], isLoading: attrLoading } =
    useSeoRevenueAttribution();
  const { data: funnel, isLoading: funnelLoading } = useSeoFunnel();
  const { data: mom, isLoading: momLoading } = useSeoTrendsMoM();

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>درآمد و قیف سئو</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          مسیر واقعی از نمایش در جستجو تا کاربر پرداخت‌کننده، به‌همراه انتساب
          درآمد به منابع مختلف
        </GlobalText>
      </div>

      {!momLoading && (mom?.campaignRevenue || mom?.technicalScore) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mom.campaignRevenue && (
            <Card className="p-4">
              <GlobalText className="text-xs text-gray-500 mb-1">
                درآمد کمپین‌ها (۳۰ روز اخیر)
              </GlobalText>
              <GlobalText className="text-2xl font-bold block">
                ${mom.campaignRevenue.current.toFixed(0)}
              </GlobalText>
              <MoMBadge deltaPercent={mom.campaignRevenue.deltaPercent} />
            </Card>
          )}
          {mom.technicalScore && (
            <Card className="p-4">
              <GlobalText className="text-xs text-gray-500 mb-1">
                نمره فنی سئو
              </GlobalText>
              <GlobalText className="text-2xl font-bold block">
                {mom.technicalScore.current}
              </GlobalText>
              <MoMBadge deltaPercent={mom.technicalScore.deltaPercent} />
            </Card>
          )}
        </div>
      )}

      <div>
        <SectionTitle>قیف سئو — ۳۰ روز اخیر</SectionTitle>
        <Card className="p-5">
          {funnelLoading ? (
            <Skeleton className="h-40" />
          ) : !funnel || funnel.steps.length === 0 ? (
            <GlobalText className="text-sm text-gray-400 py-6 text-center block">
              داده‌ی قیف در دسترس نیست
            </GlobalText>
          ) : (
            <>
              {funnel.impressionsClicksEstimated && (
                <div className="mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <GlobalText className="text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ اعداد نمایش/کلیک تخمینی‌اند — GOOGLE_API_KEY برای Search
                    Console واقعی تنظیم نشده
                  </GlobalText>
                </div>
              )}
              <FunnelBar steps={funnel.steps} />
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <GlobalText className="text-sm text-gray-500">
                  درآمد این قیف (۳۰ روز)
                </GlobalText>
                <GlobalText className="text-lg font-bold text-emerald-600">
                  ${funnel.revenue30d.toFixed(0)}
                </GlobalText>
              </div>
            </>
          )}
        </Card>
      </div>

      <div>
        <SectionTitle>انتساب درآمد به منبع</SectionTitle>
        <Card>
          {attrLoading ? (
            <div className="p-5">
              <Skeleton className="h-40" />
            </div>
          ) : (
            <RevenueAttributionTable rows={attribution} />
          )}
        </Card>
      </div>
    </div>
  );
}
