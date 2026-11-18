"use client";

import { useMemo, useState, type FormEvent } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Card } from "@/components/ui/shared";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useCreateManualPromotion,
  useDisableManualPromotion,
  useManualPromotionCampaigns,
  useManualPromotionReport,
  useUpdateManualPromotion,
} from "@/lib/api/growth/queries/useManualPromotions";

type AudienceType = "all" | "users" | "phases";
type DiscountType = "percent" | "fixed";

function localDateTime(value: Date) {
  const adjusted = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function defaultForm() {
  return {
    name: "",
    title: "",
    subtitle: "",
    ctaText: "خرید با تخفیف",
    bundleCode: "",
    discountType: "percent" as DiscountType,
    discountValue: "10",
    audienceType: "all" as AudienceType,
    audienceUserIds: "",
    audiencePhases: ["cold", "warm", "hot"],
    startsAt: localDateTime(new Date(Date.now() - 60000)),
    endsAt: localDateTime(new Date(Date.now() + 7 * 86400000)),
    maxRedemptions: "",
    perUserLimit: "1",
    priority: "0",
    active: false,
  };
}

function ManualPromotionsPage() {
  const { data: campaigns, isLoading, isError, refetch } = useManualPromotionCampaigns();
  const createMutation = useCreateManualPromotion();
  const updateMutation = useUpdateManualPromotion();
  const disableMutation = useDisableManualPromotion();
  const [form, setForm] = useState(defaultForm);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const { data: report, isLoading: reportLoading } = useManualPromotionReport(selectedReportId);
  const [notice, setNotice] = useState("");

  const busy = createMutation.isPending || updateMutation.isPending || disableMutation.isPending;
  const selectedCampaign = useMemo(
    () => campaigns?.find((item) => item.id === selectedReportId) ?? null,
    [campaigns, selectedReportId],
  );

  function patchForm(key: keyof ReturnType<typeof defaultForm>, value: any) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePhase(phase: string) {
    setForm((current) => ({
      ...current,
      audiencePhases: current.audiencePhases.includes(phase)
        ? current.audiencePhases.filter((item) => item !== phase)
        : [...current.audiencePhases, phase],
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    try {
      if (form.audienceType === "phases" && form.audiencePhases.length === 0) {
        throw new Error("حداقل یک فاز را انتخاب کنید.");
      }
      const body: Record<string, any> = {
        name: form.name.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        ctaText: form.ctaText.trim(),
        bundleCode: form.bundleCode.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        audienceType: form.audienceType,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        maxRedemptions: form.maxRedemptions.trim() ? Number(form.maxRedemptions) : null,
        perUserLimit: Number(form.perUserLimit),
        priority: Number(form.priority),
        active: form.active,
      };
      if (form.audienceType === "users") {
        body.audienceUserIds = form.audienceUserIds
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isSafeInteger(value) && value > 0);
        if (body.audienceUserIds.length === 0) throw new Error("شناسه حداقل یک کاربر معتبر را وارد کنید.");
      }
      if (form.audienceType === "phases") body.audiencePhases = form.audiencePhases;

      await createMutation.mutateAsync(body);
      setForm(defaultForm());
      setNotice("کمپین تخفیف ثبت شد.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message ?? error?.message ?? "ثبت کمپین ناموفق بود.");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setNotice("");
    try {
      await updateMutation.mutateAsync({ id, body: { active } });
    } catch (error: any) {
      setNotice(error?.response?.data?.message ?? "تغییر وضعیت کمپین ناموفق بود.");
    }
  }

  async function disable(id: string) {
    setNotice("");
    try {
      await disableMutation.mutateAsync(id);
    } catch (error: any) {
      setNotice(error?.response?.data?.message ?? "توقف کمپین ناموفق بود.");
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionTitle>تخفیف دستی و Promotion</SectionTitle>
          <p className="text-sm text-gray-500">
            تخفیف را برای محصول و مخاطب مشخص تعریف کنید؛ قیمت نهایی در Backend محاسبه می‌شود.
          </p>
        </div>
        <CustomButton label="به‌روزرسانی" onClick={() => refetch()} />
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-bold">ساخت کمپین جدید</h2>
          <p className="text-xs text-gray-500 mt-1">
            کمپین‌ها به‌صورت پیش‌فرض غیرفعال هستند و تا زمان فعال‌سازی نمایش داده نمی‌شوند.
          </p>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">نام داخلی
            <input required maxLength={120} value={form.name} onChange={(e) => patchForm("name", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">عنوان کارت
            <input required maxLength={120} value={form.title} onChange={(e) => patchForm("title", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm md:col-span-2">توضیحات
            <textarea required maxLength={280} value={form.subtitle} onChange={(e) => patchForm("subtitle", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" rows={2} />
          </label>
          <label className="text-sm">متن دکمه
            <input maxLength={60} value={form.ctaText} onChange={(e) => patchForm("ctaText", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">کد بسته فعال
            <input required maxLength={255} value={form.bundleCode} onChange={(e) => patchForm("bundleCode", e.target.value)} placeholder="مثلاً vip-month" className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">نوع تخفیف
            <select value={form.discountType} onChange={(e) => patchForm("discountType", e.target.value as DiscountType)} className="mt-1 w-full rounded border p-2 bg-transparent">
              <option value="percent">درصدی</option>
              <option value="fixed">مبلغ ثابت (ریال)</option>
            </select>
          </label>
          <label className="text-sm">{form.discountType === "percent" ? "درصد تخفیف (۱ تا ۹۰)" : "مبلغ تخفیف (ریال)"}
            <input type="number" min="1" max={form.discountType === "percent" ? "90" : "100000000"} step="1" required value={form.discountValue} onChange={(e) => patchForm("discountValue", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">نوع مخاطب
            <select value={form.audienceType} onChange={(e) => patchForm("audienceType", e.target.value as AudienceType)} className="mt-1 w-full rounded border p-2 bg-transparent">
              <option value="all">همه کاربران فعال</option>
              <option value="phases">فازهای کاربر</option>
              <option value="users">شناسه کاربران مشخص</option>
            </select>
          </label>
          {form.audienceType === "users" && (
            <label className="text-sm">شناسه کاربران (با کاما جدا کنید)
              <input required value={form.audienceUserIds} onChange={(e) => patchForm("audienceUserIds", e.target.value)} placeholder="101, 205, 309" className="mt-1 w-full rounded border p-2 bg-transparent" />
            </label>
          )}
          {form.audienceType === "phases" && (
            <fieldset className="rounded border p-3">
              <legend className="px-1 text-sm">فازهای هدف</legend>
              <div className="flex gap-4 text-sm">
                {["cold", "warm", "hot"].map((phase) => (
                  <label key={phase} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.audiencePhases.includes(phase)} onChange={() => togglePhase(phase)} />
                    {phase}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="text-sm">شروع
            <input required type="datetime-local" value={form.startsAt} onChange={(e) => patchForm("startsAt", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">پایان
            <input required type="datetime-local" value={form.endsAt} onChange={(e) => patchForm("endsAt", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">سقف کل استفاده (خالی = بدون سقف)
            <input type="number" min="1" max="1000000" value={form.maxRedemptions} onChange={(e) => patchForm("maxRedemptions", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">سقف استفاده برای هر کاربر
            <input required type="number" min="1" max="100" value={form.perUserLimit} onChange={(e) => patchForm("perUserLimit", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="text-sm">اولویت نمایش
            <input type="number" min="-1000" max="1000" value={form.priority} onChange={(e) => patchForm("priority", e.target.value)} className="mt-1 w-full rounded border p-2 bg-transparent" />
          </label>
          <label className="flex items-center gap-2 text-sm pt-6">
            <input type="checkbox" checked={form.active} onChange={(e) => patchForm("active", e.target.checked)} />
            پس از ساخت فعال شود
          </label>
          <div className="md:col-span-2 flex items-center gap-3">
            <CustomButton label={createMutation.isPending ? "در حال ثبت..." : "ساخت کمپین تخفیف"} gradient loading={busy} />
            {notice && <span className="text-sm text-gray-600">{notice}</span>}
          </div>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">کمپین‌های ثبت‌شده</h2>
          <span className="text-xs text-gray-500">{campaigns?.length ?? 0} کمپین</span>
        </div>
        {isLoading ? <Skeleton className="h-28" /> : null}
        {isError ? <p className="text-sm text-red-600">دریافت کمپین‌ها ناموفق بود.</p> : null}
        {!isLoading && (campaigns?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">هنوز کمپینی تعریف نشده است.</p>
        ) : null}
        {campaigns?.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{campaign.title}</div>
                <div className="text-xs text-gray-500">{campaign.name} · {campaign.bundleCode}</div>
              </div>
              <span className={campaign.active ? "text-xs rounded-full px-2 py-1 bg-emerald-100 text-emerald-700" : "text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-600"}>
                {campaign.active ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
              <div>تخفیف: {campaign.discountType === "percent" ? String(campaign.discountValue) + "٪" : campaign.discountValue.toLocaleString() + " ریال"}</div>
              <div>رزرو: {campaign.reservedCount ?? 0}</div>
              <div>مصرف‌شده: {campaign.redeemedCount ?? 0}</div>
              <div>سقف: {campaign.maxRedemptions ?? "نامحدود"}</div>
              <div>مخاطب: {campaign.audienceType === "all" ? "همه" : campaign.audienceType === "users" ? "کاربران مشخص" : (campaign.audiencePhases ?? []).join(", ")}</div>
              <div>هر کاربر: {campaign.perUserLimit}</div>
              <div>شروع: {new Date(campaign.startsAt).toLocaleString("fa-IR")}</div>
              <div>پایان: {new Date(campaign.endsAt).toLocaleString("fa-IR")}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => toggleActive(campaign.id, !campaign.active)} className="rounded border px-3 py-1 text-xs">
                {campaign.active ? "غیرفعال‌سازی موقت" : "فعال‌سازی"}
              </button>
              {campaign.active && (
                <button type="button" disabled={busy} onClick={() => disable(campaign.id)} className="rounded border px-3 py-1 text-xs text-red-600">
                  توقف کمپین
                </button>
              )}
              <button type="button" onClick={() => setSelectedReportId(campaign.id)} className="rounded border px-3 py-1 text-xs">
                گزارش مصرف
              </button>
            </div>
          </div>
        ))}
      </Card>

      {selectedReportId && (
        <Card className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">گزارش کمپین: {selectedCampaign?.title ?? selectedReportId}</h2>
            <button type="button" onClick={() => setSelectedReportId(null)} className="text-sm text-gray-500">بستن</button>
          </div>
          {reportLoading ? <Skeleton className="h-20" /> : report ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="text-gray-500">رزروهای جاری</div><strong>{report.reserved}</strong></div>
              <div><div className="text-gray-500">خریدهای تخفیف‌خورده</div><strong>{report.redeemed}</strong></div>
              <div><div className="text-gray-500">رزروهای آزادشده</div><strong>{report.released}</strong></div>
              <div><div className="text-gray-500">هزینه تخفیف مصرف‌شده</div><strong>{(report.discountRials / 10).toLocaleString("fa-IR")} تومان</strong></div>
            </div>
          ) : <p className="text-sm text-gray-500">گزارش در دسترس نیست.</p>}
        </Card>
      )}
    </div>
  );
}

export default withPageProtection(ManualPromotionsPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
