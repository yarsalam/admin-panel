"use client";
import { useState } from "react";
import { withPageProtection } from "@/components/withPageProtection";
import { useQuery } from "@tanstack/react-query";
import { fetchTickets, fetchTicketDetail } from "@/lib/api/safety/queries/useTickets";
import {
  useResolveTicket,
  useAddTicketMessage,
  useReAnalyzeTicket,
} from "@/lib/api/safety/mutations/useTickets";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import FormInput from "@/components/ui/FormInput";
import { useForm } from "react-hook-form";

function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  const {
    data: tickets,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["safety", "tickets", { status: statusFilter, priority: priorityFilter }],
    queryFn: () => fetchTickets({ status: statusFilter || undefined, priority: priorityFilter || undefined }),
  });

  const {
    data: ticketDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ["safety", "tickets", selectedTicket],
    queryFn: () => fetchTicketDetail(selectedTicket!),
    enabled: !!selectedTicket,
  });

  const resolveMutation = useResolveTicket();
  const addMessageMutation = useAddTicketMessage();
  const reAnalyzeMutation = useReAnalyzeTicket();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { message: "" },
  });

  const onResolve = (id: number) => {
    const resolution = prompt("علت حل شدن تیکت را بنویسید:");
    if (resolution) {
      resolveMutation.mutate({ id, resolution });
      refetch();
    }
  };

  const onSendMessage = (data: { message: string }) => {
    if (!selectedTicket || !data.message) return;
    // فرض می‌کنیم userId=1 (ادمین) – می‌توان بعداً از context خواند
    addMessageMutation.mutate({ id: selectedTicket, userId: 1, content: data.message });
    reset();
  };

  const onReAnalyze = (id: number) => {
    const content = prompt("متن جدید برای تحلیل:");
    if (content) {
      reAnalyzeMutation.mutate({ id, content, userId: 1 });
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle>مدیریت تیکت‌ها</SectionTitle>

      {/* فیلترها */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="closed">بسته</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800"
        >
          <option value="">همه اولویت‌ها</option>
          <option value="urgent">فوری</option>
          <option value="critical">بحرانی</option>
          <option value="normal">عادی</option>
        </select>
        <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded">
          اعمال فیلتر
        </button>
      </div>

      {/* لیست تیکت‌ها */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2 space-y-3 max-h-[70vh] overflow-y-auto">
          {isLoading && <Skeleton className="h-20" />}
          {isError && <ErrorState message="خطا در دریافت تیکت‌ها" />}
          {tickets && tickets.length === 0 && <p className="text-gray-500">تیکتی یافت نشد</p>}
          {tickets?.map((ticket: any) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket.id)}
              className={`p-4 rounded-lg shadow cursor-pointer transition ${
                selectedTicket === ticket.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-300"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{ticket.title}</h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{ticket.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
              <div className="text-xs mt-2">
                اولویت: <span className="font-medium">{ticket.priority}</span> | کاربر: {ticket.userId}
              </div>
            </div>
          ))}
        </div>

        {/* جزئیات تیکت */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-h-[400px]">
          {!selectedTicket && <p className="text-gray-500">یک تیکت را برای مشاهده جزئیات انتخاب کنید</p>}
          {selectedTicket && detailLoading && <Skeleton className="h-40" />}
          {selectedTicket && detailError && <ErrorState message="خطا در بارگذاری جزئیات" />}
          {selectedTicket && ticketDetail && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">{ticketDetail.title}</h2>
              <p className="text-sm">{ticketDetail.description}</p>
              <div className="text-xs text-gray-500">
                وضعیت: {ticketDetail.status} | اولویت: {ticketDetail.priority}
              </div>

              {/* پیام‌ها */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ticketDetail.messages?.map((m: any) => (
                  <div key={m.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="flex justify-between text-xs">
                      <span>{m.sender === "user" ? "کاربر" : "ادمین"}</span>
                      <span>{new Date(m.createdAt).toLocaleString("fa-IR")}</span>
                    </div>
                    <p className="text-sm">{m.content}</p>
                  </div>
                ))}
              </div>

              {/* فرم ارسال پیام */}
              <form onSubmit={handleSubmit(onSendMessage)} className="flex gap-2">
                <FormInput
                  type="text"
                  name="message"
                  control={control}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1"
                />
                <CustomButton type="submit" label="ارسال" gradient loading={addMessageMutation.isPending} />
              </form>

              {/* دکمه‌های عملیات */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => onResolve(ticketDetail.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  حل تیکت
                </button>
                <button
                  onClick={() => onReAnalyze(ticketDetail.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  تحلیل مجدد با AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withPageProtection(TicketsPage, {
  panelPermission: "view_safety_panel",
  itemPermissions: "manage_users",
});