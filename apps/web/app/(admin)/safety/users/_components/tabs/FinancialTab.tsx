"use client";

const statusColor: Record<string, string> = {
  success:  'bg-green-100 text-green-700',
  failed:   'bg-red-100 text-red-700',
  pending:  'bg-yellow-100 text-yellow-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function FinancialTab({ data360 }: { userId: number; data360: any }) {
  const { financial } = data360;
  if (!financial) return <p className="text-gray-500">اطلاعات مالی موجود نیست</p>;

  const { payments = [], boost, vip, credits } = financial;
  const totalPaid   = payments.filter((p: any) => p.status === 'success').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const failedCount = payments.filter((p: any) => p.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">جمع پرداختی (ریال)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
          <p className="text-xs text-gray-500 mt-1">پرداخت ناموفق</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-purple-600">{credits?.balance ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">اعتبار فعلی</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <p className={`text-2xl font-bold ${vip?.isActive ? 'text-yellow-500' : 'text-gray-400'}`}>
            {vip?.isActive ? '★ VIP' : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {vip?.expiresAt ? `تا ${new Date(vip.expiresAt).toLocaleDateString('fa-IR')}` : 'وضعیت VIP'}
          </p>
        </div>
      </div>

      {/* Boost */}
      {boost && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-sm mb-2">Boost فعال</h3>
          <div className="flex gap-4 text-sm">
            <span>تعداد: <b>{boost.count ?? '—'}</b></span>
            <span>انقضا: <b>{boost.expiresAt ? new Date(boost.expiresAt).toLocaleDateString('fa-IR') : '—'}</b></span>
          </div>
        </div>
      )}

      {/* لیست پرداخت‌ها */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">تاریخچه پرداخت‌ها ({payments.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b dark:border-gray-700">
                <th className="text-right pb-2">مبلغ</th>
                <th className="text-right pb-2">نوع</th>
                <th className="text-right pb-2">وضعیت</th>
                <th className="text-right pb-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2">{(p.amount ?? 0).toLocaleString()}</td>
                  <td className="py-2">{p.type ?? '—'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[p.status] ?? 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-400 text-xs">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fa-IR') : '—'}
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr><td colSpan={4} className="py-4 text-gray-500 text-center">پرداختی ثبت نشده</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}