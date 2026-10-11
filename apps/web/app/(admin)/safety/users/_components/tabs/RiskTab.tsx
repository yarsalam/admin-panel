"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSendNotification } from "@/lib/api/safety/mutations/useUser360Actions";
import { useReAnalyzeUser } from "@/lib/api/safety/mutations/useUser360";
import { useState } from "react";

const LEVEL_CONFIG = {
  low: {
    label: "ایمن",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    icon: "✅",
    desc: "این کاربر رفتار عادی دارد و نیازی به اقدام فوری نیست.",
  },
  medium: {
    label: "نیاز به نظارت",
    color: "text-yellow-700 dark:text-yellow-400",
    bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    icon: "⚠️",
    desc: "برخی سیگنال‌های هشداردهنده وجود دارد. نظارت مستمر توصیه می‌شود.",
  },
  high: {
    label: "پرخطر",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
    icon: "🚨",
    desc: "این کاربر سیگنال‌های جدی دارد. بررسی دستی لازم است.",
  },
  critical: {
    label: "بحرانی",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    icon: "🔴",
    desc: "خطر بالا. مسدود کردن یا محدودسازی فوری توصیه می‌شود.",
  },
};

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  none: {
    label: "اقدام لازم نیست",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  monitor: {
    label: "نظارت مستمر",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  manual_review: {
    label: "بررسی دستی",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  restrict: {
    label: "محدودسازی اکانت",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  ban: {
    label: "مسدود کردن فوری",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

const METRIC_META: Record<
  string,
  { label: string; icon: string; good?: (v: number) => boolean }
> = {
  app_opens: { label: "باز کردن اپ (۷ روز)", icon: "📱", good: (v) => v > 0 },
  messages7d: { label: "پیام ارسالی (۷ روز)", icon: "💬", good: (v) => v > 0 },
  views7d: { label: "پروفایل بازدیدشده (۷ روز)", icon: "👁️" },
  likes7d: { label: "لایک ارسالی (۷ روز)", icon: "❤️" },
  matches7d: { label: "مچ جدید (۷ روز)", icon: "🤝", good: (v) => v > 0 },
  boostUsed7d: { label: "Boost استفاده‌شده", icon: "🚀" },
  purchases7d: { label: "خرید اخیر (۷ روز)", icon: "💳", good: (v) => v > 0 },
  retentionDays: {
    label: "روز فعال در ۳۰ روز",
    icon: "📅",
    good: (v) => v > 7,
  },
  pastPayments: { label: "کل پرداخت‌های موفق", icon: "✅", good: (v) => v > 0 },
  engagement_score: {
    label: "امتیاز تعامل کلی",
    icon: "⭐",
    good: (v) => v > 0.5,
  },
  days_since_signup: { label: "روز از ثبت‌نام", icon: "🗓️" },
  swipe_velocity: {
    label: "سرعت سوایپ (ثانیه)",
    icon: "⚡",
    good: (v) => v > 30,
  },
  avg_session_time: {
    label: "میانگین زمان جلسه (ثانیه)",
    icon: "⏱️",
    good: (v) => v > 60,
  },
  session_depth: { label: "عمق جلسه (صفحه)", icon: "📊" },
  dismiss_rate: { label: "نرخ رد پروفایل", icon: "🚫" },
  promotion_ctr: {
    label: "نرخ کلیک پیشنهاد",
    icon: "🎯",
    good: (v) => v > 0.1,
  },
  conversion_score: { label: "احتمال خرید", icon: "💰", good: (v) => v > 0.5 },
  last_purchase_days: { label: "روز از آخرین خرید", icon: "🛒" },
  hour_of_day: { label: "ساعت اوج فعالیت", icon: "🕐" },
  is_weekend: { label: "فعال‌تر آخر هفته", icon: "📆" },
};

function ScoreRing({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = Math.min((value ?? 0) / 100, 1) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="7"
        />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <text
          x="42"
          y="48"
          textAnchor="middle"
          fill={color}
          fontSize="17"
          fontWeight="bold"
        >
          {value ?? 0}
        </text>
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export default function RiskTab({
  userId,
  data360,
}: {
  userId: number;
  data360: any;
}) {
  const qc = useQueryClient();

  const { data: risk, isLoading: riskLoading } = useQuery({
    queryKey: ["safety", "risk", userId],
    queryFn: () => apiClient.get(`/safety/risk/${userId}`).then((r) => r.data),
  });

  const {
    data: aiAdvice,
    isLoading: aiLoading,
    refetch: refetchAdvice,
  } = useQuery({
    queryKey: ["safety", "user", userId, "ai-advice"],
    queryFn: () =>
      apiClient.get(`/safety/users/${userId}/ai-advice`).then((r) => r.data),
    retry: false,
  });

  const { data: notifsData } = useQuery({
    queryKey: ["safety", "user", userId, "notifications"],
    queryFn: () =>
      apiClient
        .get(`/safety/users/${userId}/notifications`)
        .then((r) => r.data),
    initialData: data360?.notifications,
  });

  const sendNotif = useSendNotification(userId);
  const reAnalyze = useReAnalyzeUser();

  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");

  const metrics = data360?.metrics ?? {};

  const notifications: any[] = Array.isArray(notifsData)
    ? notifsData
    : Array.isArray(notifsData?.data)
      ? notifsData.data
      : Array.isArray(notifsData?.items)
        ? notifsData.items
        : [];

  const levelKey = (risk?.level ?? "low") as keyof typeof LEVEL_CONFIG;
  const levelCfg = LEVEL_CONFIG[levelKey] ?? LEVEL_CONFIG.low;
  const actionCfg =
    ACTION_CONFIG[risk?.recommendedAction ?? "none"] ?? ACTION_CONFIG.none;

  return (
    <div className="space-y-5" dir="rtl">
      {/* ── Risk Score ── */}
      {riskLoading ? (
        <Skeleton className="h-44" />
      ) : risk ? (
        <div className={`rounded-xl border-2 p-5 ${levelCfg.bg}`}>
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex gap-4">
              <ScoreRing
                value={risk.riskScore ?? 0}
                label="ریسک"
                color={
                  (risk.riskScore ?? 0) > 60
                    ? "#dc2626"
                    : (risk.riskScore ?? 0) > 30
                      ? "#f97316"
                      : "#16a34a"
                }
              />
              <ScoreRing
                value={risk.trustScore ?? 100}
                label="اعتماد"
                color="#2563eb"
              />
            </div>
            <div className="flex-1 min-w-48 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelCfg.icon}</span>
                <span className={`text-lg font-bold ${levelCfg.color}`}>
                  سطح: {levelCfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {levelCfg.desc}
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${actionCfg.color}`}
              >
                پیشنهاد: {actionCfg.label}
              </span>
            </div>
          </div>

          {(risk.signals?.length ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
              <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                🔍 سیگنال‌های هشدار:
              </p>
              <div className="flex flex-wrap gap-2">
                {risk.signals.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs bg-white/70 dark:bg-gray-800/70 px-2 py-1 rounded-full border border-black/10 dark:border-white/10"
                  >
                    ⚠️ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {risk.riskScore === 0 && !risk.signals?.length && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              * امتیاز صفر یعنی هیچ سیگنال هشداری شناسایی نشده — کاربر بدون مشکل
              است.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-center text-sm text-gray-500">
          داده ریسک در دسترس نیست
        </div>
      )}

      {/* ── Metrics ── */}
      {Object.keys(metrics).filter((k) => !["userId", "id"].includes(k))
        .length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            📊 <span>آمار رفتاری کاربر</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(metrics)
              .filter(([k]) => !["userId", "id"].includes(k))
              .map(([k, v]) => {
                const meta = METRIC_META[k];
                const num = typeof v === "number" ? v : parseFloat(String(v));
                const isGood = meta?.good ? meta.good(num) : null;
                return (
                  <div
                    key={k}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{meta?.icon ?? "📌"}</span>
                      {isGood !== null && (
                        <span
                          className={`text-xs font-bold ${isGood ? "text-green-500" : "text-gray-400"}`}
                        >
                          {isGood ? "✓" : "—"}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {typeof v === "number" && v % 1 !== 0
                        ? num.toFixed(2)
                        : String(v)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                      {meta?.label ?? k}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── AI Advice ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            🤖 <span>تحلیل هوشمند کاربر</span>
          </h3>
          <button
            onClick={() =>
              reAnalyze.mutate(
                { userId, bio: data360?.profile?.bio ?? "", messages: [] },
                { onSuccess: () => refetchAdvice() },
              )
            }
            disabled={reAnalyze.isPending}
            className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {reAnalyze.isPending ? (
              <>
                <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full inline-block" />{" "}
                در حال تحلیل...
              </>
            ) : (
              "تحلیل مجدد با AI"
            )}
          </button>
        </div>

        {aiLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : aiAdvice ? (
          <div className="space-y-4">
            {aiAdvice.personality_summary && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1.5">
                  🧠 تحلیل شخصیت
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {aiAdvice.personality_summary}
                </p>
              </div>
            )}
            {Array.isArray(aiAdvice.tips) && aiAdvice.tips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  💡 توصیه‌های دستیار
                </p>
                <ul className="space-y-2">
                  {aiAdvice.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!aiAdvice.personality_summary && !aiAdvice.tips?.length && (
              <p className="text-sm text-gray-400 text-center py-3">
                تحلیلی موجود نیست — روی «تحلیل مجدد» کلیک کنید
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">تحلیلی انجام نشده است</p>
            <button
              onClick={() =>
                reAnalyze.mutate(
                  { userId, bio: data360?.profile?.bio ?? "", messages: [] },
                  { onSuccess: () => refetchAdvice() },
                )
              }
              disabled={reAnalyze.isPending}
              className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              شروع تحلیل با AI
            </button>
          </div>
        )}
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            🔔 <span>آخرین نوتیفیکیشن‌ها</span>
            {notifications.length > 0 && (
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowNotifForm((v) => !v)}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showNotifForm ? "انصراف" : "ارسال پیام"}
          </button>
        </div>

        {showNotifForm && (
          <div className="space-y-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <input
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="عنوان پیام (مثال: اطلاعیه مهم)"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              placeholder="متن پیام برای کاربر..."
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() =>
                sendNotif.mutate(
                  { title: notifTitle, body: notifBody },
                  {
                    onSuccess: () => {
                      setShowNotifForm(false);
                      setNotifTitle("");
                      setNotifBody("");
                      qc.invalidateQueries({
                        queryKey: ["safety", "user", userId, "notifications"],
                      });
                    },
                  },
                )
              }
              disabled={
                !notifTitle.trim() || !notifBody.trim() || sendNotif.isPending
              }
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {sendNotif.isPending ? (
                <>
                  <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full inline-block" />{" "}
                  در حال ارسال...
                </>
              ) : (
                "📤 ارسال نوتیفیکیشن"
              )}
            </button>
          </div>
        )}

        {notifications.length > 0 ? (
          <ul className="space-y-1 max-h-52 overflow-y-auto">
            {notifications.slice(0, 20).map((n: any, i: number) => (
              <li
                key={n.id ?? i}
                className="flex items-start gap-2 text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                    n.type === "message"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : n.type === "match"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : n.type === "visitor"
                          ? "bg-purple-100 text-purple-700"
                          : n.type === "superlike"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {n.type}
                </span>
                <span className="flex-1 text-gray-700 dark:text-gray-300">
                  {n.message ?? n.title ?? "—"}
                </span>
                {!n.is_read && (
                  <span
                    className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5"
                    title="خوانده نشده"
                  />
                )}
                <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                  {(n.created_at ?? n.createdAt)
                    ? new Date(n.created_at ?? n.createdAt).toLocaleDateString(
                        "fa-IR",
                      )
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            نوتیفیکیشنی ندارد
          </p>
        )}
      </div>
    </div>
  );
}
