"use client";
import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTickets,
  fetchTicketDetail,
  fetchTicketAiAnalysis,
} from "@/lib/api/safety/queries/useTickets";
import {
  useResolveTicket,
  useAddTicketMessage,
  useReAnalyzeTicket,
} from "@/lib/api/safety/mutations/useTickets";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import SectionTitle from "@/components/ui/SectionTitle";
import { useForm } from "react-hook-form";

const STATUS_LABEL: Record<string, string> = {
  open: "باز",
  in_progress: "در حال بررسی",
  resolved: "حل شده",
  closed: "بسته",
  escalated: "ارجاع شده",
  pending: "در انتظار",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "پایین",
  medium: "متوسط",
  high: "زیاد",
  urgent: "فوری",
};

const STATUS_CLASS: Record<string, string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
  closed: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  escalated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

type DetailTab = "messages" | "ai";

function AIAnalysisTab({
  ticket,
  onReAnalyze,
  isPending,
  isLoading,
}: {
  ticket: any;
  onReAnalyze: () => void;
  isPending: boolean;
  isLoading?: boolean;
}) {
  const ai = ticket.aiSuggestions ?? {};
  const sentiment = ticket.sentimentAnalysis ?? {};
  const score = ticket.aiConfidenceScore;
  const keywords: string[] = ticket.keywords ?? [];

  const hasData =
    score != null ||
    (typeof ai === "object" && ai !== null && Object.keys(ai).length > 0) ||
    keywords.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onReAnalyze}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-sm transition"
        >
          {isPending ? (
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <span>🔄</span>
          )}
          تحلیل مجدد
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
          <span className="animate-spin text-2xl inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />
          <p>در حال دریافت تحلیل AI...</p>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
          <span className="text-3xl">🤖</span>
          <p>داده‌ای از تحلیل AI موجود نیست</p>
          <p className="text-xs text-gray-300">
            با دکمه «تحلیل مجدد» اجرا کنید
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">🎯 دسته‌بندی</div>
              <div className="font-semibold text-sm truncate">
                {ai.suggestedCategory ?? ticket.category ?? "—"}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">⚡ اولویت</div>
              <div
                className={`font-semibold text-sm ${
                  (ai.suggestedPriority ?? ticket.priority) === "urgent" ||
                  (ai.suggestedPriority ?? ticket.priority) === "high"
                    ? "text-red-500"
                    : ""
                }`}
              >
                {PRIORITY_LABEL[ai.suggestedPriority ?? ticket.priority] ??
                  ai.suggestedPriority ??
                  "—"}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">📊 اطمینان AI</div>
              <div className="font-semibold text-sm">
                {score != null ? `${Math.round(score * 100)}%` : "—"}
              </div>
            </div>
          </div>

          {Object.keys(sentiment).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-gray-500 mb-2">
                احساس کاربر
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {sentiment.label && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sentiment.label === "negative" ||
                      sentiment.label === "NEGATIVE"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : sentiment.label === "positive" ||
                            sentiment.label === "POSITIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {sentiment.label === "negative" ||
                    sentiment.label === "NEGATIVE"
                      ? "😟 منفی"
                      : sentiment.label === "positive" ||
                          sentiment.label === "POSITIVE"
                        ? "😊 مثبت"
                        : "😐 خنثی"}
                  </span>
                )}
                {sentiment.urgencyScore != null && (
                  <span className="text-xs text-gray-500">
                    🔥 امتیاز فوریت:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {sentiment.urgencyScore}
                    </span>
                  </span>
                )}
                {sentiment.score != null && (
                  <span className="text-xs text-gray-500">
                    دقت مدل:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {Math.round(sentiment.score * 100)}%
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          {keywords.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">
                🏷️ کلمات کلیدی
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw: string) => (
                  <span
                    key={kw}
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ai.autoResponse && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                💬 پاسخ خودکار AI
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {ai.autoResponse}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {ai.estimatedResolutionTime != null && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">
                  ⏱️ زمان تخمینی حل
                </div>
                <div className="font-medium">
                  {ai.estimatedResolutionTime} ساعت
                </div>
              </div>
            )}
            {ai.revenueImpact != null && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">
                  💰 تأثیر درآمدی
                </div>
                <div
                  className={`font-medium ${
                    ai.revenueImpact < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {ai.revenueImpact}
                </div>
              </div>
            )}
          </div>

          {(ticket.slaBreached || ticket.slaDeadline) && (
            <div
              className={`rounded-lg p-3 text-sm ${
                ticket.slaBreached
                  ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="text-xs font-medium text-gray-500 mb-1">SLA</div>
              <div className="flex gap-4 flex-wrap">
                {ticket.slaBreached && (
                  <span className="text-red-600 dark:text-red-400 font-medium text-xs">
                    ⏰ SLA نقض شده
                  </span>
                )}
                {ticket.slaDeadline && (
                  <span className="text-xs text-gray-500">
                    مهلت: {new Date(ticket.slaDeadline).toLocaleString("fa-IR")}
                  </span>
                )}
                {ticket.firstResponseAt && (
                  <span className="text-xs text-gray-500">
                    اولین پاسخ:{" "}
                    {new Date(ticket.firstResponseAt).toLocaleString("fa-IR")}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("messages");

  const queryClient = useQueryClient();

  const {
    data: tickets,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "safety",
      "tickets",
      { status: statusFilter, priority: priorityFilter },
    ],
    queryFn: () =>
      fetchTickets({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  });

  const { data: ticketDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["safety", "tickets", selectedTicketId],
    queryFn: () => fetchTicketDetail(selectedTicketId!),
    enabled: !!selectedTicketId,
  });

  const {
    data: aiAnalysisData,
    isLoading: aiLoading,
    refetch: refetchAi,
  } = useQuery({
    queryKey: ["safety", "tickets", selectedTicketId, "ai-analysis"],
    queryFn: () => fetchTicketAiAnalysis(selectedTicketId!),
    enabled: !!selectedTicketId && activeTab === "ai",
    staleTime: 0,
  });

  const resolveMutation = useResolveTicket();
  const addMessageMutation = useAddTicketMessage();
  const reAnalyzeMutation = useReAnalyzeTicket();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { message: "" },
  });

  const onResolve = (id: number) => {
    const resolution = prompt("علت حل شدن تیکت را بنویسید:");
    if (resolution) {
      resolveMutation.mutate(
        { id, resolution },
        {
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["safety", "tickets"] }),
        },
      );
    }
  };

  const onSendMessage = (data: { message: string }) => {
    if (!selectedTicketId || !data.message.trim()) return;
    addMessageMutation.mutate(
      { id: selectedTicketId, userId: 1, content: data.message },
      {
        onSuccess: () => {
          reset();
          queryClient.invalidateQueries({
            queryKey: ["safety", "tickets", selectedTicketId],
          });
        },
      },
    );
  };

  const onReAnalyze = () => {
    if (!selectedTicketId || !ticketDetail) return;
    reAnalyzeMutation.mutate(
      {
        id: selectedTicketId,
        userId: 1,
        content: `[re-analyze] ${ticketDetail.description}`,
      },
      {
        onSuccess: () => {
          // هر ۲ ثانیه تا ۳ بار چک کن
          let attempts = 0;
          const poll = setInterval(() => {
            refetchAi();
            attempts++;
            if (attempts >= 3) clearInterval(poll);
          }, 2000);
        },
      },
    );
  };

  const handleTicketSelect = (id: number) => {
    setSelectedTicketId(id);
    setActiveTab("messages");
  };

  const isTicketClosed =
    ticketDetail?.status === "resolved" || ticketDetail?.status === "closed";

  return (
    <div className="space-y-4 h-full">
      <SectionTitle>مدیریت تیکت‌ها</SectionTitle>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded text-sm dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="in_progress">در حال بررسی</option>
          <option value="resolved">حل شده</option>
          <option value="closed">بسته</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border p-2 rounded text-sm dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="">همه اولویت‌ها</option>
          <option value="urgent">فوری</option>
          <option value="high">زیاد</option>
          <option value="medium">متوسط</option>
          <option value="low">پایین</option>
        </select>

        {(statusFilter || priorityFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setPriorityFilter("");
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            ✕ حذف فیلتر
          </button>
        )}

        <span className="text-sm text-gray-400 mr-auto">
          {tickets ? `${tickets.length} تیکت` : ""}
        </span>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        <div className="w-full lg:w-2/5 flex flex-col overflow-hidden border rounded-lg dark:border-gray-700">
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {isLoading && (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            )}
            {isError && <ErrorState message="خطا در دریافت تیکت‌ها" />}
            {!isLoading && tickets?.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                تیکتی یافت نشد
              </div>
            )}

            {tickets?.map((ticket: any) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketSelect(ticket.id)}
                className={`p-3 rounded-lg cursor-pointer transition border ${
                  selectedTicketId === ticket.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400"
                    : "bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-sm truncate">
                    {ticket.title}
                  </h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {ticket.slaBreached && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        ⏰ SLA
                      </span>
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        STATUS_CLASS[ticket.status] ??
                        "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[ticket.status] ?? ticket.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {ticket.description}
                </p>

                <div className="text-xs mt-2 flex gap-3 text-gray-400 flex-wrap">
                  <span>
                    اولویت:{" "}
                    <span
                      className={`font-medium ${
                        ticket.priority === "urgent" ||
                        ticket.priority === "high"
                          ? "text-red-500"
                          : "text-gray-500 dark:text-gray-300"
                      }`}
                    >
                      {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
                    </span>
                  </span>
                  {ticket.user?.nickname && (
                    <span>
                      کاربر:{" "}
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {ticket.user.nickname}
                      </span>
                    </span>
                  )}
                  {ticket.createdAt && (
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col flex-1 border rounded-lg dark:border-gray-700 overflow-hidden">
          {!selectedTicketId ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              یک تیکت را از لیست انتخاب کنید
            </div>
          ) : detailLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-20" />
              <Skeleton className="h-40" />
            </div>
          ) : ticketDetail ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {ticketDetail.title}
                    </h2>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          STATUS_CLASS[ticketDetail.status] ?? ""
                        }`}
                      >
                        {STATUS_LABEL[ticketDetail.status] ??
                          ticketDetail.status}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {PRIORITY_LABEL[ticketDetail.priority] ??
                          ticketDetail.priority}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {ticketDetail.category}
                      </span>
                    </div>
                  </div>
                  {!isTicketClosed && (
                    <button
                      onClick={() => onResolve(ticketDetail.id)}
                      disabled={resolveMutation.isPending}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition flex-shrink-0 disabled:opacity-50"
                    >
                      {resolveMutation.isPending ? "..." : "✓ حل شد"}
                    </button>
                  )}
                </div>

                {ticketDetail.user && (
                  <div className="mt-2 text-sm text-gray-500">
                    کاربر:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {ticketDetail.user.nickname}
                    </span>
                    {" · "}
                    {ticketDetail.user.phone}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {ticketDetail.description}
                </p>
              </div>

              <div className="flex border-b dark:border-gray-700 text-sm">
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`px-4 py-2 font-medium transition border-b-2 ${
                    activeTab === "messages"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  💬 پیام‌ها
                  {ticketDetail.messages?.length > 0 && (
                    <span className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                      {ticketDetail.messages.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`px-4 py-2 font-medium transition border-b-2 ${
                    activeTab === "ai"
                      ? "border-purple-500 text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  🤖 تحلیل AI
                  {ticketDetail.aiConfidenceScore != null && (
                    <span className="ml-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                      {Math.round(ticketDetail.aiConfidenceScore * 100)}%
                    </span>
                  )}
                </button>
              </div>

              {activeTab === "messages" ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {ticketDetail.messages?.length === 0 && (
                      <p className="text-sm text-gray-400 text-center pt-6">
                        پیامی ثبت نشده
                      </p>
                    )}
                    {ticketDetail.messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            msg.type === "user"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                              : msg.type === "system"
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs italic"
                                : "bg-white dark:bg-gray-800 border dark:border-gray-700"
                          }`}
                        >
                          {msg.type === "support" && (
                            <div className="text-xs text-gray-400 mb-1">
                              پشتیبانی
                            </div>
                          )}
                          <p>{msg.content}</p>
                          <span className="text-xs opacity-50 mt-1 block">
                            {new Date(msg.createdAt).toLocaleString("fa-IR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isTicketClosed && (
                    <form
                      onSubmit={handleSubmit(onSendMessage)}
                      className="p-3 border-t dark:border-gray-700 flex gap-2"
                    >
                      <input
                        {...register("message")}
                        placeholder="پیام پشتیبانی..."
                        className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <button
                        type="submit"
                        disabled={addMessageMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition disabled:opacity-50"
                      >
                        {addMessageMutation.isPending ? "..." : "ارسال"}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <AIAnalysisTab
                  ticket={{ ...ticketDetail, ...(aiAnalysisData ?? {}) }}
                  onReAnalyze={onReAnalyze}
                  isPending={reAnalyzeMutation.isPending}
                  isLoading={aiLoading}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default withPageProtection(TicketsPage, {
  panelPermission: "view_safety_panel",
  itemPermissions: "manage_users",
});
