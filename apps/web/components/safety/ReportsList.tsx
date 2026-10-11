"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConfirmReport, useRejectReport, useBlockUserFromReport } from "@/lib/api/safety/mutations/useReports";

export default function ReportsList({ reports, userId }: { reports: any[]; userId: number }) {
  const confirmMutation = useConfirmReport();
  const rejectMutation = useRejectReport();
  const blockMutation = useBlockUserFromReport();

  if (!reports) return <Skeleton className="h-40" />;

  if (reports.length === 0) return <p className="text-gray-500">گزارشی علیه این کاربر ثبت نشده است</p>;

  return (
    <div className="space-y-4">
      {reports.map((report: any) => (
        <div key={report.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">گزارش #{report.id}</span>
            <span className="text-xs bg-yellow-200 dark:bg-yellow-700 px-2 py-0.5 rounded">{report.status}</span>
          </div>
          <p className="mb-2">{report.reason}</p>
          <div className="text-xs text-gray-400 mb-3">
            گزارش‌دهنده: {report.reporter?.nickname || report.reporterId}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => confirmMutation.mutate(report.id)}
              disabled={confirmMutation.isPending}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              تأیید گزارش
            </button>
            <button
              onClick={() => rejectMutation.mutate(report.id)}
              disabled={rejectMutation.isPending}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              رد گزارش
            </button>
            <button
              onClick={() => blockMutation.mutate({ reportId: report.id, adminId: "system" })}
              disabled={blockMutation.isPending}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              مسدود کردن کاربر
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}