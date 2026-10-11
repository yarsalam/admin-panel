"use client";
import { useReAnalyzeUser } from "@/lib/api/safety/mutations/useUser360";

export default function AiAdvicePanel({
  advice,
  userId,
}: {
  advice: any;
  userId: number;
}) {
  const reAnalyzeMutation = useReAnalyzeUser();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h3 className="font-semibold text-lg mb-3">توصیه‌های دستیار</h3>
        {advice?.tips?.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {advice.tips.map((tip: string, idx: number) => (
              <li key={idx} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">توصیه‌ای موجود نیست</p>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h3 className="font-semibold text-lg mb-3">تحلیل شخصیت</h3>
        {advice?.personality_summary ? (
          <p className="text-sm">{advice.personality_summary}</p>
        ) : (
          <p className="text-gray-500">تحلیل شخصیت موجود نیست</p>
        )}
      </div>

      <button
        onClick={() =>
          reAnalyzeMutation.mutate({ userId, bio: "", messages: [] })
        }
        disabled={reAnalyzeMutation.isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {reAnalyzeMutation.isPending ? "در حال تحلیل..." : "تحلیل مجدد با AI"}
      </button>
    </div>
  );
}
