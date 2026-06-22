"use client";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ActivityTimeline({ data }: { data: any }) {
  if (!data) return <Skeleton className="h-40" />;

  const { visitors, interactionsSent, interactionsReceived, messages } = data;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg mb-2">بازدیدهای پروفایل</h3>
        <p>{visitors?.length || 0} بازدید</p>
      </section>
      <section>
        <h3 className="font-semibold text-lg mb-2">تعاملات ارسال‌شده</h3>
        <p>{interactionsSent?.length || 0} تعامل</p>
        <ul className="text-sm space-y-1">
          {interactionsSent?.slice(0, 5).map((ix: any, i: number) => (
            <li key={i} className="text-gray-500">
              {ix.type} → کاربر {ix.receiverId}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-semibold text-lg mb-2">تعاملات دریافتی</h3>
        <p>{interactionsReceived?.length || 0} تعامل</p>
      </section>
      <section>
        <h3 className="font-semibold text-lg mb-2">پیام‌ها</h3>
        <p>{messages?.length || 0} پیام</p>
        <ul className="text-sm space-y-1">
          {messages?.slice(0, 5).map((msg: any, i: number) => (
            <li key={i} className="text-gray-500">
              به کاربر {msg.toId}: {msg.content?.slice(0, 40)}...
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}