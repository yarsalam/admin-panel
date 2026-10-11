"use client";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FinancialSummary({ data }: { data: any }) {
  if (!data) return <Skeleton className="h-40" />;

  const { payments, boost, vip, credits } = data;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg mb-2">پرداخت‌ها</h3>
        {payments?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b">
                <th className="py-2">شناسه</th>
                <th className="py-2">محصول</th>
                <th className="py-2">مبلغ</th>
                <th className="py-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.id}</td>
                  <td className="py-2">{p.productCode}</td>
                  <td className="py-2">{p.amount?.toLocaleString()} تومان</td>
                  <td className="py-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">هیچ پرداختی ثبت نشده</p>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium">بوست</h4>
          <p>{boost ? `تعداد: ${boost.amount || 0}` : "ندارد"}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium">VIP</h4>
          <p>{vip ? `فعال تا: ${vip.expiresAt?.slice(0, 10) || "نامشخص"}` : "ندارد"}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium">اعتبار</h4>
          <p>{credits ? `${credits.amount} سکه` : "ندارد"}</p>
        </div>
      </div>
    </div>
  );
}