"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { withPageProtection } from "@/components/withPageProtection";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import SectionTitle from "@/components/ui/SectionTitle";
import GlobalText from "@/components/ui/GlobalText";
import { Card } from "@/components/ui/shared";

type RiskData = {
  riskScore?: number;
  trustScore?: number;
  level?: string;
  recommendedAction?: string;
  signals?: string[];
};

const fetchRisk = (userId: number) =>
  apiClient.get<RiskData>(`/safety/risk/${userId}`).then((response) => response.data);

const levelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const actionLabels: Record<string, string> = {
  none: "اقدام لازم نیست",
  monitor: "نظارت مستمر",
  manual_review: "بررسی دستی",
  restrict: "محدودسازی",
  ban: "مسدود کردن",
};

function RiskDashboardContent() {
  const searchParams = useSearchParams();
  const rawUserId = searchParams.get("userId");
  const parsedUserId = rawUserId && /^\d+$/.test(rawUserId) ? Number(rawUserId) : 0;
  const userId = Number.isSafeInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : 0;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["safety", "risk", userId],
    queryFn: () => fetchRisk(userId),
    enabled: userId > 0,
  });

  if (userId <= 0) {
    return (
      <Card className="p-5 space-y-2">
        <GlobalText as="h2" className="font-bold">شناسهٔ کاربر مشخص نشده است</GlobalText>
        <GlobalText className="text-sm text-gray-500">
          برای مشاهدهٔ ارزیابی ریسک، شناسهٔ معتبر را به نشانی صفحه اضافه کنید؛
          نمونه: ?userId=123
        </GlobalText>
      </Card>
    );
  }

  if (isLoading) return <Skeleton className="h-40" />;
  if (isError || !data) return <ErrorState message="خطا در بارگذاری ارزیابی ریسک کاربر" />;

  const signals = Array.isArray(data.signals) ? data.signals : [];

  return (
    <div className="space-y-4">
      <GlobalText className="text-xs text-gray-500">شناسه کاربر: {userId}</GlobalText>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <GlobalText className="text-xs text-gray-500">Risk Score</GlobalText>
          <GlobalText className="text-4xl font-bold">{data.riskScore ?? "—"}</GlobalText>
          <GlobalText className="text-xs text-gray-400">از ۱۰۰</GlobalText>
        </Card>
        <Card className="p-4 text-center">
          <GlobalText className="text-xs text-gray-500">Trust Score</GlobalText>
          <GlobalText className="text-4xl font-bold">{data.trustScore ?? "—"}</GlobalText>
          <GlobalText className="text-xs text-gray-400">از ۱۰۰</GlobalText>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${levelColors[data.level ?? ""] ?? "bg-gray-100 text-gray-700"}`}>
          سطح: {data.level ?? "نامشخص"}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          پیشنهاد: {actionLabels[data.recommendedAction ?? ""] ?? data.recommendedAction ?? "نامشخص"}
        </span>
      </div>

      {signals.length > 0 ? (
        <Card className="p-4 space-y-2">
          <GlobalText className="font-medium text-sm text-red-600">سیگنال‌های هشدار</GlobalText>
          <ul className="space-y-1">
            {signals.map((signal, index) => (
              <li key={`${index}-${signal}`} className="text-sm flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="p-4">
          <GlobalText className="text-sm text-gray-500">برای این کاربر سیگنال هشداری گزارش نشده است.</GlobalText>
        </Card>
      )}
    </div>
  );
}

function SafetyDashboardPage() {
  return (
    <div className="space-y-6 p-4">
      <SectionTitle>داشبورد ایمنی و ارزیابی ریسک</SectionTitle>
      <Suspense fallback={<Skeleton className="h-40" />}>
        <RiskDashboardContent />
      </Suspense>
    </div>
  );
}

export default withPageProtection(SafetyDashboardPage, {
  panelPermission: "view_safety_panel",
  itemPermissions: "manage_users",
});
