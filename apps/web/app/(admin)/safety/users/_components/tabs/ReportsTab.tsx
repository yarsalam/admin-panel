"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

const statusColor: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-red-100 text-red-700',
  rejected:    'bg-gray-100 text-gray-600',
  action_taken:'bg-purple-100 text-purple-700',
};

export default function ReportsTab({ userId, data360 }: { userId: number; data360: any }) {
  const qc = useQueryClient();
  const { reports = [], moderationLogs = [] } = data360;

  const confirmMut = useMutation({
    mutationFn: (id: number) => apiClient.post(`/safety/reports/${id}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['safety', 'user360', userId] }),
  });
  const rejectMut = useMutation({
    mutationFn: (id: number) => apiClient.post(`/safety/reports/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['safety', 'user360', userId] }),
  });

  return (
    <div className="space-y-6">
      {/* گزارش‌ها */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">گزارش‌های دریافتی ({reports.length})</h3>
        {!reports.length ? (
          <p className="text-gray-500 text-sm">گزارشی وجود ندارد</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r: any) => (
              <li key={r.id} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{r.reason ?? r.type ?? 'گزارش'}</p>
                    {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                    <p className="text-xs text-gray-400">
                      توسط: #{r.reporterId ?? r.reporter?.id} —{' '}
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('fa-IR') : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status] ?? 'bg-gray-100'}`}>
                      {r.status}
                    </span>
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => confirmMut.mutate(r.id)}
                          className="text-xs px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          تأیید
                        </button>
                        <button
                          onClick={() => rejectMut.mutate(r.id)}
                          className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          رد
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* لاگ مودریشن */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">لاگ مودریشن ({moderationLogs.length})</h3>
        {!moderationLogs.length ? (
          <p className="text-gray-500 text-sm">لاگی وجود ندارد</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {moderationLogs.map((log: any) => (
              <li key={log.id} className="flex items-center justify-between text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-xs text-gray-400">
                  {log.createdAt ? new Date(log.createdAt).toLocaleDateString('fa-IR') : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}