"use client";

// جایگزین date-fns با Intl که نیاز به نصب ندارد
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "همین الان";
  if (m < 60) return `${m} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ساعت پیش`;
  const d = Math.floor(h / 24);
  return `${d} روز پیش`;
}

export default function ActivityTab({
  data360,
}: {
  userId: number;
  data360: any;
}) {
  const { activity } = data360;

  if (!activity)
    return <p className="text-gray-500 text-sm">داده فعالیتی وجود ندارد</p>;

  const {
    visitors = [],
    interactionsSent = [],
    interactionsReceived = [],
    messages = [],
  } = activity;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* آمار سریع */}
      <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "بازدیدکننده", value: visitors.length },
          { label: "لایک ارسالی", value: interactionsSent.length },
          { label: "لایک دریافتی", value: interactionsReceived.length },
          { label: "پیام ارسالی", value: messages.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center"
          >
            <p className="text-2xl font-bold text-blue-600">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* بازدیدکنندگان */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">آخرین بازدیدکنندگان</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {visitors.length === 0 && (
            <li className="text-gray-500 text-xs">بازدیدی ثبت نشده</li>
          )}
          {visitors.slice(0, 15).map((v: any) => (
            <li
              key={v.id}
              className="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0"
            >
              <span>کاربر #{v.visitorId ?? v.profile?.id}</span>
              <span className="text-xs text-gray-400">
                {v.visitedAt ? timeAgo(v.visitedAt) : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* تعاملات ارسالی */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">تعاملات ارسالی</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {interactionsSent.length === 0 && (
            <li className="text-gray-500 text-xs">تعاملی ندارد</li>
          )}
          {interactionsSent.slice(0, 15).map((i: any) => (
            <li
              key={i.id}
              className="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0"
            >
              <span>→ #{i.receiverId ?? i.receiver?.id}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${i.type === "like" ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"}`}
              >
                {i.type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* تعاملات دریافتی */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">تعاملات دریافتی</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {interactionsReceived.length === 0 && (
            <li className="text-gray-500 text-xs">تعاملی ندارد</li>
          )}
          {interactionsReceived.slice(0, 15).map((i: any) => (
            <li
              key={i.id}
              className="flex items-center justify-between text-sm py-1 border-b dark:border-gray-700 last:border-0"
            >
              <span>← #{i.senderId ?? i.sender?.id}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${i.type === "like" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {i.type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* پیام‌ها */}
      <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm mb-3">آخرین پیام‌های ارسالی</h3>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {messages.length === 0 && (
            <li className="text-gray-500 text-xs">پیامی ندارد</li>
          )}
          {messages.slice(0, 10).map((m: any) => (
            <li
              key={m.id}
              className="text-sm border-b dark:border-gray-700 pb-2 last:border-0"
            >
              <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                <span>به: #{m.toId ?? m.to?.id ?? m.receiverId}</span>
                <span>{m.createdAt ? timeAgo(m.createdAt) : "—"}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-1">
                {m.content}
              </p>
              {m.moderationStatus === "flagged" && (
                <span className="text-xs text-orange-500">⚠️ flagged</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
