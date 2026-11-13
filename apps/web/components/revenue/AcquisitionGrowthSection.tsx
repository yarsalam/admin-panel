"use client";

import { useMemo, useState } from "react";
import {
  useAcquisitionGrowth,
  useCreateAcquisitionCost,
  type AcquisitionGrowthRow,
  type CreateAcquisitionCostInput,
  type RevenueCurrency,
} from "@/lib/api/exec/mutations/useRevenue";

const fmt = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value) ? "—" : value.toLocaleString("fa-IR");

const money = (value: number | null | undefined, currency: RevenueCurrency) => {
  if (value == null || !Number.isFinite(value)) return "ثبت نشده";
  return `${fmt(value)} ${currency === "IRT" ? "ریال" : currency}`;
};

const rate = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value) ? "—" : `${value.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`;

function localDateTimeValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function AcquisitionGrowthSection({
  currency,
}: {
  currency: RevenueCurrency;
}) {
  const [days, setDays] = useState(90);
  const { data, isLoading, isError, refetch } = useAcquisitionGrowth(days, currency);
  const createCost = useCreateAcquisitionCost();

  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [category, setCategory] = useState<CreateAcquisitionCostInput["category"]>("media");
  const [amount, setAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState(localDateTimeValue());
  const [notes, setNotes] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);

  const submitCost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!source.trim() || !Number.isFinite(numericAmount) || numericAmount < 0 || !occurredAt) {
      setFormMessage("منبع، مبلغ معتبر و زمان هزینه را وارد کنید.");
      return;
    }

    const payload: CreateAcquisitionCostInput = {
      source: source.trim(),
      medium: medium.trim() || null,
      campaign: campaign.trim() || null,
      campaignId: campaignId.trim() || null,
      category,
      amount: numericAmount,
      currency,
      occurredAt: new Date(occurredAt).toISOString(),
      notes: notes.trim() || null,
      idempotencyKey: `acq-cost-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
    };

    try {
      await createCost.mutateAsync(payload);
      setAmount("");
      setNotes("");
      setFormMessage("هزینه با موفقیت در دفترکل ثبت شد.");
    } catch {
      setFormMessage("ثبت هزینه ناموفق بود؛ سطح دسترسی و اتصال API را بررسی کنید.");
    }
  };

  return (
    <section className="space-y-4" dir="rtl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">موتور رشد و کیفیت جذب</h2>
          <p className="text-xs text-gray-500 mt-1">
            انتساب First-touch؛ مقایسهٔ جذب، تکمیل پروفایل، تعامل، بازگشت و خرید بر اساس داده‌های ثبت‌شده
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">
            پنجرهٔ ورود کاربران
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="block mt-1 rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
            >
              <option value={30}>۳۰ روز</option>
              <option value={90}>۹۰ روز</option>
              <option value={180}>۱۸۰ روز</option>
              <option value={365}>۳۶۵ روز</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
          >
            به‌روزرسانی
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-300/70 bg-amber-50/70 dark:bg-amber-900/10 p-3 text-sm">
        <strong>تفسیر محتاطانهٔ داده‌ها:</strong>
        <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
          CAC فقط از هزینه‌هایی محاسبه می‌شود که صریحاً برای همان منبع، مدیوم، کمپین و ارز ثبت شده‌اند. نبود هزینه یعنی CAC نامعلوم، نه صفر. درآمد این گزارش، درآمد ناخالص خرید محصولِ ثبت‌شده در رویداد PURCHASE است؛ شارژ کیف پول فروش محصول محسوب نمی‌شود و بازپرداخت‌ها هنوز از آن کسر نشده‌اند.
        </p>
        <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
          اختلاف کانال‌ها و گروه‌های تخفیف صرفاً توصیفی است؛ این گزارش اثر علّی، ROI قطعی یا افزایش LTV ناشی از تخفیف را اثبات نمی‌کند.
        </p>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm">ثبت هزینهٔ واقعی کانال</h3>
          <p className="text-xs text-gray-500 mt-1">
            تبلیغات، تولید محتوا، آژانس، ابزار یا نیروی انسانی فقط با مبلغ و ارز مستند ثبت شوند؛ هزینهٔ نامشخص را صفر وارد نکنید.
          </p>
        </div>
        <form onSubmit={submitCost} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-600">
            منبع
            <input
              list="acquisition-sources"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              required
              maxLength={80}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
              placeholder="google_organic / instagram / chatgpt_search"
            />
            <datalist id="acquisition-sources">
              {["google_organic","google_ads","bing_organic","chatgpt_search","perplexity","copilot","gemini","claude","instagram","telegram","whatsapp","bale","linkedin","youtube","tiktok","facebook","x","referral","partner","email","sms","direct","unattributed"].map(item => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label className="text-xs text-gray-600">
            مدیوم
            <input
              value={medium}
              onChange={(event) => setMedium(event.target.value)}
              maxLength={80}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
              placeholder="social / organic / cpc / referral"
            />
          </label>
          <label className="text-xs text-gray-600">
            نام کمپین
            <input
              value={campaign}
              onChange={(event) => setCampaign(event.target.value)}
              maxLength={160}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            شناسه کمپین
            <input
              value={campaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              maxLength={120}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            نوع هزینه
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CreateAcquisitionCostInput["category"])}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            >
              <option value="media">تبلیغات و رسانه</option>
              <option value="content">تولید محتوا</option>
              <option value="labor">نیروی انسانی</option>
              <option value="agency">آژانس و پیمانکار</option>
              <option value="tools">ابزارها</option>
              <option value="other">سایر</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">
            مبلغ ({currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            زمان وقوع هزینه
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600 md:col-span-2">
            توضیحات / مرجع سند
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              className="block w-full rounded-lg border px-3 py-2 mt-1 bg-white dark:bg-gray-800"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={createCost.isPending}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {createCost.isPending ? "در حال ثبت..." : "ثبت هزینه"}
            </button>
            {formMessage ? <span className="text-xs mr-3 text-gray-600">{formMessage}</span> : null}
          </div>
        </form>
      </div>

      {isLoading ? <div className="rounded-xl border p-6 text-sm text-gray-500">در حال دریافت داده‌های جذب...</div> : null}
      {isError ? <div className="rounded-xl border p-6 text-sm text-red-600">گزارش رشد دریافت نشد؛ اتصال API را بررسی کنید.</div> : null}

      {!isLoading && !isError && data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">کاربران جذب‌شده</div>
              <div className="text-xl font-bold mt-1">{fmt(data.rows.reduce((sum, row) => sum + row.newUsers, 0))}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">تکمیل پروفایل</div>
              <div className="text-xl font-bold mt-1">{fmt(data.rows.reduce((sum, row) => sum + row.profileCompletedUsers, 0))}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">خریداران نخستین</div>
              <div className="text-xl font-bold mt-1">{fmt(data.rows.reduce((sum, row) => sum + row.firstPurchasers, 0))}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">پنجرهٔ گزارش</div>
              <div className="text-xl font-bold mt-1">{fmt(data.periodDays)} روز</div>
            </div>
          </div>

          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {["منبع / مدیوم / کمپین","کاربران جدید","تکمیل پروفایل","تعامل معنادار","D7 بازگشت","D30 بازگشت","خریدار نخستین","درآمد ناخالص خرید","هزینه ثبت‌شده","CAC","درآمد/کاربر","درآمد/CAC"].map(label => (
                    <th key={label} className="px-3 py-3 text-right font-semibold">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row: AcquisitionGrowthRow) => (
                  <tr key={`${row.source}:${row.medium ?? ""}:${row.campaignId ?? row.campaign ?? ""}`}>
                    <td className="px-3 py-3">
                      <div className="font-semibold">{row.source}</div>
                      <div className="text-gray-500">{row.medium ?? "بدون مدیوم"}</div>
                      <div className="text-gray-500">{row.campaign ?? row.campaignId ?? "بدون کمپین"}</div>
                    </td>
                    <td className="px-3 py-3">{fmt(row.newUsers)}</td>
                    <td className="px-3 py-3">{rate(row.profileCompletionRatePercent)} <span className="text-gray-400">({fmt(row.profileCompletedUsers)})</span></td>
                    <td className="px-3 py-3">{rate(row.firstInteractionRatePercent)} <span className="text-gray-400">({fmt(row.firstInteractionUsers)})</span></td>
                    <td className="px-3 py-3">{rate(row.d7RetentionRatePercent)} <span className="text-gray-400">({fmt(row.d7RetainedUsers)}/{fmt(row.d7EligibleUsers)})</span></td>
                    <td className="px-3 py-3">{rate(row.d30RetentionRatePercent)} <span className="text-gray-400">({fmt(row.d30RetainedUsers)}/{fmt(row.d30EligibleUsers)})</span></td>
                    <td className="px-3 py-3">{fmt(row.firstPurchasers)}</td>
                    <td className="px-3 py-3">{money(row.grossPurchaseRevenueRials, "IRT")}</td>
                    <td className="px-3 py-3">{money(row.costAmount, row.costCurrency)}</td>
                    <td className="px-3 py-3 font-semibold">{row.cac === null ? "نامعلوم" : money(row.cac, row.costCurrency)}</td>
                    <td className="px-3 py-3">{row.grossRevenuePerAcquiredUser === null ? "—" : money(row.grossRevenuePerAcquiredUser, "IRT")}</td>
                    <td className="px-3 py-3">{row.ltvOverCac === null ? "—" : `${row.ltvOverCac.toLocaleString("fa-IR")}×`}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr><td className="p-5 text-center text-gray-500" colSpan={12}>برای این بازه دادهٔ ثبت‌شده‌ای وجود ندارد.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border p-3 space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <p><strong>مدل انتساب:</strong> {data.attributionModel}؛ هر کاربر فقط در یک کانال First-touch شمرده می‌شود. Last-touch جداگانه ذخیره شده، اما در این جدول دوباره‌شماری ایجاد نمی‌کند.</p>
            <p>D7 فقط برای کاربران با حداقل ۷ روز عمر و فعالیت در روزهای ۷ تا ۱۳ محاسبه می‌شود. D30 فقط برای کاربران با حداقل ۳۰ روز عمر و فعالیت در روزهای ۳۰ تا ۳۶ محاسبه می‌شود.</p>
            <p>تعامل معنادار شامل Like، SuperLike، Match و ارسال پیام است. بازدید صفحه به‌تنهایی تعامل معنادار نیست.</p>
            <p>{data.interpretation}</p>
            <ul className="list-disc pr-5">
              {data.limitations.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </>
      ) : null}
    </section>
  );
}
