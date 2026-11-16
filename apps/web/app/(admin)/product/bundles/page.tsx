"use client";

import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBundles,
  createBundle,
  updateBundle,
  deleteBundle,
} from "@/lib/api/product/queries/useBundles";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Card } from "@/components/ui/shared";
import { Skeleton } from "@/components/ui/Skeleton";

type BundleItemType = "credits" | "boost" | "vip";
interface BundleItem {
  type: BundleItemType;
  amount: number;
  durationDays?: number;
}

const itemLabel = (item: BundleItem) => {
  if (item.type === "credits") return String(item.amount) + " اعتبار";
  if (item.type === "boost") return String(item.amount) + " بوست";
  return "VIP " + String(item.durationDays ?? 30) + " روزه";
};

function BundlesPage() {
  const qc = useQueryClient();
  const { data: bundles, isLoading, isError } = useQuery({
    queryKey: ["bundles"],
    queryFn: getBundles,
  });
  const [newBundle, setNewBundle] = useState({
    code: "",
    price: "",
    items: [] as BundleItem[],
  });
  const [itemDraft, setItemDraft] = useState({
    type: "credits" as BundleItemType,
    amount: "20",
    durationDays: "30",
  });
  const [notice, setNotice] = useState("");

  const createMut = useMutation({
    mutationFn: createBundle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bundles"] });
      setNewBundle({ code: "", price: "", items: [] });
      setNotice("بسته با موفقیت ساخته شد.");
    },
    onError: (error: any) =>
      setNotice(error?.response?.data?.message ?? "ساخت بسته ناموفق بود."),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      updateBundle(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
    onError: (error: any) =>
      setNotice(error?.response?.data?.message ?? "به‌روزرسانی بسته ناموفق بود."),
  });
  const deleteMut = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
    onError: (error: any) =>
      setNotice(error?.response?.data?.message ?? "غیرفعال‌سازی بسته ناموفق بود."),
  });

  const addItem = () => {
    setNotice("");
    const amount = Number(itemDraft.amount);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      setNotice("تعداد آیتم باید عدد صحیح و مثبت باشد.");
      return;
    }
    if (itemDraft.type === "vip") {
      const durationDays = Number(itemDraft.durationDays);
      if (!Number.isSafeInteger(durationDays) || durationDays < 1) {
        setNotice("مدت VIP باید عدد صحیح و مثبت باشد.");
        return;
      }
      setNewBundle((current) => ({
        ...current,
        items: [...current.items, { type: "vip", amount, durationDays }],
      }));
    } else {
      setNewBundle((current) => ({
        ...current,
        items: [...current.items, { type: itemDraft.type, amount }],
      }));
    }
  };

  const removeItem = (index: number) => {
    setNewBundle((current) => ({
      ...current,
      items: current.items.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const create = () => {
    setNotice("");
    if (!newBundle.code.trim() || !Number.isSafeInteger(Number(newBundle.price)) ||
        Number(newBundle.price) < 1 || newBundle.items.length === 0) {
      setNotice("کد، قیمت ریالی معتبر و حداقل یک آیتم لازم است.");
      return;
    }
    createMut.mutate({
      code: newBundle.code.trim(),
      price: Number(newBundle.price),
      items: newBundle.items,
      active: true,
    });
  };

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div>
        <SectionTitle>مدیریت بسته‌های خرید</SectionTitle>
        <p className="text-sm text-gray-500">
          بسته‌های فعال در فروشگاه نمایش داده می‌شوند و مبنای تخفیف‌های Promotion هستند.
          قیمت را به ریال وارد کنید.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="font-bold">ساخت بسته جدید</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">کد یکتا
            <input
              value={newBundle.code}
              onChange={(e) => setNewBundle({ ...newBundle, code: e.target.value })}
              placeholder="مثلاً vip-month"
              maxLength={255}
              className="mt-1 border p-2 rounded w-full bg-transparent"
            />
          </label>
          <label className="text-sm">قیمت (ریال)
            <input
              type="number"
              min="1"
              step="1"
              value={newBundle.price}
              onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value })}
              className="mt-1 border p-2 rounded w-full bg-transparent"
            />
          </label>
        </div>

        <div className="rounded-lg border p-3 space-y-3">
          <h3 className="text-sm font-semibold">آیتم‌های داخل بسته</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm">نوع آیتم
              <select
                value={itemDraft.type}
                onChange={(e) => setItemDraft({ ...itemDraft, type: e.target.value as BundleItemType })}
                className="mt-1 border p-2 rounded w-full bg-transparent"
              >
                <option value="credits">اعتبار</option>
                <option value="boost">Boost</option>
                <option value="vip">VIP</option>
              </select>
            </label>
            <label className="text-sm">تعداد
              <input
                type="number"
                min="1"
                step="1"
                value={itemDraft.amount}
                onChange={(e) => setItemDraft({ ...itemDraft, amount: e.target.value })}
                className="mt-1 border p-2 rounded w-full bg-transparent"
              />
            </label>
            {itemDraft.type === "vip" && (
              <label className="text-sm">مدت VIP (روز)
                <input
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  value={itemDraft.durationDays}
                  onChange={(e) => setItemDraft({ ...itemDraft, durationDays: e.target.value })}
                  className="mt-1 border p-2 rounded w-full bg-transparent"
                />
              </label>
            )}
          </div>
          <CustomButton label="افزودن آیتم به بسته" onClick={addItem} />
          <div className="space-y-2">
            {newBundle.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>{itemLabel(item)}</span>
                <button type="button" onClick={() => removeItem(index)} className="text-red-600">حذف</button>
              </div>
            ))}
            {newBundle.items.length === 0 && (
              <p className="text-xs text-gray-500">حداقل یک آیتم اضافه کنید؛ یک بسته می‌تواند چند نوع امتیاز داشته باشد.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CustomButton
            onClick={create}
            label={createMut.isPending ? "در حال ساخت..." : "ساخت بسته فعال"}
            gradient
            loading={createMut.isPending}
            disabled={busy || newBundle.items.length === 0}
          />
          {notice && <span className="text-sm text-gray-600">{notice}</span>}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-bold">فهرست بسته‌ها</h2>
        {isLoading ? <Skeleton className="h-28" /> : null}
        {isError ? <p className="text-sm text-red-600">دریافت بسته‌ها ناموفق بود.</p> : null}
        {!isLoading && (bundles?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">هنوز بسته‌ای تعریف نشده است.</p>
        ) : null}
        {bundles?.map((bundle: any) => (
          <div key={bundle.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{bundle.code}</div>
                <div className="text-xs text-gray-500">
                  {(Number(bundle.price) / 10).toLocaleString("fa-IR")} تومان
                </div>
              </div>
              <span className={bundle.active ? "text-xs rounded-full px-2 py-1 bg-emerald-100 text-emerald-700" : "text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-600"}>
                {bundle.active ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {(bundle.items ?? []).map((item: BundleItem, index: number) => (
                <span key={index} className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1">{itemLabel(item)}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => updateMut.mutate({ id: bundle.id, body: { active: !bundle.active } })}
                className="rounded border px-3 py-1 text-xs"
              >
                {bundle.active ? "غیرفعال‌سازی" : "فعال‌سازی"}
              </button>
              {bundle.active && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deleteMut.mutate(bundle.id)}
                  className="rounded border px-3 py-1 text-xs text-red-600"
                >
                  توقف فروش بسته
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default withPageProtection(BundlesPage, {
  panelPermission: "view_product_panel",
  itemPermissions: ["edit_content", "delete_content"],
});
