"use client";
import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import { fetchFlaggedImages, fetchFlaggedMessages } from "@/lib/api/safety/queries/useModeration";
import { useApproveContent, useRejectContent } from "@/lib/api/safety/mutations/useModeration";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import SectionTitle from "@/components/ui/SectionTitle";

function ModerationPage() {
  const [activeTab, setActiveTab] = useState<"images" | "messages">("images");
  const {
    data: images,
    isLoading: imagesLoading,
    isError: imagesError,
    refetch: refetchImages,
  } = useQuery({
    queryKey: ["safety", "moderation", "images"],
    queryFn: fetchFlaggedImages,
  });
  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["safety", "moderation", "messages"],
    queryFn: fetchFlaggedMessages,
  });

  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();

  const handleApprove = (type: "image" | "message", id: number) => {
    approveMutation.mutate({ type, id });
    if (type === "image") refetchImages();
    else refetchMessages();
  };

  const handleReject = (type: "image" | "message", id: number) => {
    rejectMutation.mutate({ type, id });
    if (type === "image") refetchImages();
    else refetchMessages();
  };

  return (
    <div className="space-y-6">
      <SectionTitle>بررسی محتوا</SectionTitle>

      {/* تب‌ها */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab("images")}
          className={`pb-2 px-4 ${activeTab === "images" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"}`}
        >
          تصاویر پرچم‌دار
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-2 px-4 ${activeTab === "messages" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"}`}
        >
          پیام‌های پرچم‌دار
        </button>
      </div>

      {/* محتوای تب‌ها */}
      {activeTab === "images" && (
        <div>
          {imagesLoading && <Skeleton className="h-40" />}
          {imagesError && <ErrorState message="خطا در بارگذاری تصاویر" />}
          {images && images.length === 0 && <p className="text-gray-500">هیچ تصویر پرچم‌داری وجود ندارد</p>}
          {images && images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img: any) => (
                <div key={img.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 relative">
                  <img src={img.url} alt="flagged" className="w-full h-32 object-cover rounded" />
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleApprove("image", img.id)}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      تأیید
                    </button>
                    <button
                      onClick={() => handleReject("image", img.id)}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      رد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "messages" && (
        <div>
          {messagesLoading && <Skeleton className="h-40" />}
          {messagesError && <ErrorState message="خطا در بارگذاری پیام‌ها" />}
          {messages && messages.length === 0 && <p className="text-gray-500">هیچ پیام پرچم‌داری وجود ندارد</p>}
          {messages && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="mb-2 text-sm">{msg.content}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    فرستنده: {msg.senderId} | گیرنده: {msg.receiverId}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove("message", msg.id)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      تأیید
                    </button>
                    <button
                      onClick={() => handleReject("message", msg.id)}
                      className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      رد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default withPageProtection(ModerationPage, {
  panelPermission: "view_safety_panel",
  itemPermissions: ["edit_content", "delete_content"],
});