"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import {
  useApproveImage,
  useRejectImage,
} from "@/lib/api/safety/mutations/useUser360Actions";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";

export default function ImagesTab({
  userId,
}: {
  userId: number;
  data360: any;
}) {
  const {
    data: images,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["safety", "user", userId, "images"],
    queryFn: () =>
      apiClient.get(`/safety/users/${userId}/images`).then((r) => r.data),
  });

  const approveMutation = useApproveImage(userId);
  const rejectMutation = useRejectImage(userId);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) return <Skeleton className="h-60" />;
  if (!images?.length)
    return <p className="text-gray-500">هیچ عکسی وجود ندارد</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img: any) => (
          <div
            key={img.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
          >
            <div className="relative">
              <img src={img.url} alt="" className="w-full h-36 object-cover" />
              {/* وضعیت */}
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  img.moderationStatus === "approved"
                    ? "bg-green-100 text-green-700"
                    : img.moderationStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : img.moderationStatus === "flagged"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {img.moderationStatus ?? "pending"}
              </span>
              {img.isMain && (
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  اصلی
                </span>
              )}
            </div>
            <div className="p-2 flex gap-1 flex-wrap">
              <button
                onClick={() => approveMutation.mutate(img.id)}
                disabled={approveMutation.isPending}
                className="flex-1 text-xs py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                تأیید
              </button>
              <button
                onClick={() => setRejectingId(img.id)}
                className="flex-1 text-xs py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                رد
              </button>
              <button
                onClick={() => {
                  apiClient
                    .post(`/safety/users/${userId}/images/${img.id}/requeue`)
                    .then(() => refetch());
                }}
                className="flex-1 text-xs py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Requeue
              </button>
              <button
                onClick={() => {
                  if (confirm("حذف شود؟"))
                    apiClient
                      .delete(`/safety/users/${userId}/images/${img.id}`)
                      .then(() => refetch());
                }}
                className="flex-1 text-xs py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal رد کردن */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold">علت رد</h3>
            <input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="علت را بنویسید..."
              className="w-full border rounded p-2 text-sm dark:bg-gray-700"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-sm text-gray-500"
              >
                لغو
              </button>
              <button
                onClick={() => {
                  rejectMutation.mutate({
                    imageId: rejectingId,
                    reason: rejectReason,
                  });
                  setRejectingId(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                رد کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
