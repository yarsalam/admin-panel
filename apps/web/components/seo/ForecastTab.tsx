"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import GlobalText from "@/components/ui/GlobalText";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { useTrafficProxyHistory } from "@/lib/api/exec/mutations/useSeo";
import apiClient from "@/lib/api/client";
import { Card } from "../ui/shared";

interface ForecastResult {
  forecast: Array<{
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
  }>;
  growth_rate: number;
  peak_periods: string[];
}

export function ForecastTab() {
  const { data: realHistory = [], isLoading: historyLoading } =
    useTrafficProxyHistory(90);
  const [historicalInput, setHistoricalInput] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [useManual, setUseManual] = useState(false);

  const mutation = useMutation<ForecastResult, Error, object[]>({
    mutationFn: (historicalData) =>
      apiClient
        .post("/growth/campaigns/forecast", { historicalData, days: 90 })
        .then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      setParseError("");
    },
    onError: () =>
      setParseError("خطا در پیش‌بینی — سرویس ai_seo را بررسی کنید (پورت ۸۰۲۱)"),
  });

  // 🆕 با رسیدن سری واقعی ثبت‌نام‌ها، پیش‌بینی خودکار اجرا می‌شود
  useEffect(() => {
    if (
      realHistory.length >= 14 &&
      !useManual &&
      !result &&
      !mutation.isPending
    ) {
      mutation.mutate(realHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realHistory, useManual]);

  const handleManualForecast = () => {
    setParseError("");
    try {
      const parsed = JSON.parse(historicalInput);
      if (!Array.isArray(parsed) || parsed.length < 14)
        throw new Error("min 14");
      mutation.mutate(parsed);
    } catch {
      setParseError(
        'فرمت نادرست — باید آرایه JSON با حداقل ۱۴ رکورد باشد: [{"date":"2024-01-01","traffic":1000},...]',
      );
    }
  };

  const maxYhat = result
    ? Math.max(...result.forecast.map((f) => f.yhat), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>پیش‌بینی روند با هوش مصنوعی</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2 mb-4">
          مدل Prophet روی سری روزانه‌ی ثبت‌نام‌های واقعی (به‌عنوان Proxy رشد)
          اجرا می‌شود — بدون نیاز به وارد کردن دستی داده
        </GlobalText>
      </div>

      <Card className="p-5">
        {historyLoading ? (
          <GlobalText className="text-sm text-gray-400">
            در حال دریافت سری تاریخی ثبت‌نام‌ها...
          </GlobalText>
        ) : realHistory.length < 14 ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <GlobalText className="text-sm text-amber-700 dark:text-amber-400">
              کمتر از ۱۴ روز داده‌ی ثبت‌نام واقعی موجود است — می‌توانید داده‌ی
              دستی وارد کنید.
            </GlobalText>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <GlobalText className="text-sm text-gray-500">
              {realHistory.length} روز داده‌ی واقعی ثبت‌نام بارگذاری شد
            </GlobalText>
            {mutation.isPending && (
              <span className="text-xs text-blue-500 flex items-center gap-1.5">
                <span className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                در حال محاسبه...
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setUseManual((v) => !v)}
          className="text-xs text-blue-600 dark:text-blue-400 underline mb-3"
        >
          {useManual
            ? "بازگشت به داده‌ی خودکار"
            : "وارد کردن داده‌ی دستی (پیشرفته)"}
        </button>

        {useManual && (
          <div className="mb-4">
            <textarea
              value={historicalInput}
              onChange={(e) => {
                setHistoricalInput(e.target.value);
                setParseError("");
              }}
              rows={6}
              placeholder={`[{"date":"2024-01-01","traffic":1000},...]`}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {parseError && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <GlobalText className="text-sm text-red-600 dark:text-red-400">
                  {parseError}
                </GlobalText>
              </div>
            )}
            <CustomButton
              label={
                mutation.isPending
                  ? "در حال پیش‌بینی..."
                  : "اجرای پیش‌بینی با داده‌ی دستی"
              }
              onClick={handleManualForecast}
              loading={mutation.isPending}
              disabled={!historicalInput}
              gradient
              className="!w-auto px-6 mt-3"
            />
          </div>
        )}

        {result && (
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <GlobalText className="text-xs text-gray-500 mb-1">
                  نرخ رشد پیش‌بینی
                </GlobalText>
                <p
                  className={`text-2xl font-bold ${result.growth_rate >= 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {result.growth_rate >= 0 ? "+" : ""}
                  {(result.growth_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <GlobalText className="text-xs text-gray-500 mb-1">
                  اوج (۹۰ روز)
                </GlobalText>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.max(...result.forecast.map((f) => f.yhat)).toFixed(0)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <GlobalText className="text-xs text-gray-500 mb-1">
                  بهترین ماه‌ها
                </GlobalText>
                <p className="text-sm font-bold text-purple-600">
                  {result.peak_periods?.join("، ") || "–"}
                </p>
              </div>
            </div>
            <div>
              <GlobalText className="text-xs text-gray-500 mb-2">
                نمودار پیش‌بینی ۹۰ روز آینده
              </GlobalText>
              <div className="flex items-end gap-px h-28 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 overflow-hidden">
                {result.forecast
                  .filter((_, idx) => idx % 2 === 0)
                  .map((point, i) => {
                    const pct = (point.yhat / maxYhat) * 100;
                    return (
                      <div
                        key={i}
                        title={`${new Date(point.ds).toLocaleDateString("fa-IR")}: ${Math.round(point.yhat)}`}
                        className="flex-1 bg-blue-400 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors cursor-pointer rounded-sm"
                        style={{ height: `${pct}%` }}
                      />
                    );
                  })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-3">
                <span>امروز</span>
                <span>۹۰ روز دیگر</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
