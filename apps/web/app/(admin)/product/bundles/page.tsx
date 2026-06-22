"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBundles,
  createBundle,
  updateBundle,
  deleteBundle,
} from "@/lib/api/product/queries/useBundles";
import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Skeleton } from "@/components/ui/Skeleton";

function BundlesPage() {
  const qc = useQueryClient();
  const { data: bundles, isLoading } = useQuery({
    queryKey: ["bundles"],
    queryFn: getBundles,
  });
  const createMut = useMutation({
    mutationFn: createBundle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
  });
  const deleteMut = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
  });
  const [newBundle, setNewBundle] = useState({ code: "", price: 0, items: [] });

  return (
    <div className="p-4 space-y-6">
      <SectionTitle>مدیریت باندل‌ها</SectionTitle>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-2 max-w-md">
        <input
          placeholder="کد"
          value={newBundle.code}
          onChange={(e) => setNewBundle({ ...newBundle, code: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="قیمت"
          value={newBundle.price}
          onChange={(e) =>
            setNewBundle({ ...newBundle, price: +e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <CustomButton
          onClick={() => createMut.mutate(newBundle)}
          label="ایجاد باندل"
          gradient
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <table className="w-full text-sm bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="p-2">کد</th>
              <th className="p-2">قیمت</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {bundles?.map((b: any) => (
              <tr key={b.id}>
                <td className="p-2">{b.code}</td>
                <td className="p-2">{b.price?.toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteMut.mutate(b.id)}
                    className="text-red-600"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withPageProtection(BundlesPage, {
  panelPermission: "view_product_panel",
  itemPermissions: "delete_content",
});
