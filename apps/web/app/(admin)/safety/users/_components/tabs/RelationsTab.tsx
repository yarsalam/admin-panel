"use client";
import { useState } from "react";
import { useUserRelations } from "@/lib/api/safety/queries/useUser360";
import { useRemoveRelation } from "@/lib/api/safety/mutations/useUser360Actions";

const typeColors: Record<string, string> = {
  match: "bg-green-100 text-green-700",
  like: "bg-pink-100 text-pink-700",
  block: "bg-red-100 text-red-700",
  mutual_like: "bg-purple-100 text-purple-700",
};

export default function RelationsTab({
  userId,
}: {
  userId: number;
  data360: any;
}) {
  const [filter, setFilter] = useState<string>("");
  // این تب خودش lazy fetch می‌کند چون data360 فقط 100 آیتم اول داره
  const { data: relations = [], isLoading } = useUserRelations(
    userId,
    filter || undefined,
  );
  const removeMut = useRemoveRelation(userId);

  return (
    <div className="space-y-4">
      {/* فیلتر */}
      <div className="flex gap-2 flex-wrap">
        {["", "like", "match", "block", "mutual_like"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filter === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {t || "همه"}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-gray-500 text-sm">در حال بارگذاری...</p>}

      <div className="space-y-2">
        {(relations as any[]).map((r: any) => {
          const isSource = r.userId === userId;
          const other = isSource ? r.targetId : r.userId;
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${typeColors[r.status] ?? "bg-gray-100"}`}
                >
                  {r.status}
                </span>
                <span className="text-sm">
                  {isSource ? `→ کاربر #${other}` : `← کاربر #${other}`}
                </span>
                {r.createdAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("رابطه حذف شود؟")) removeMut.mutate(other);
                }}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                حذف
              </button>
            </div>
          );
        })}
        {!isLoading && !(relations as any[]).length && (
          <p className="text-gray-500 text-sm">رابطه‌ای یافت نشد</p>
        )}
      </div>
    </div>
  );
}
