"use client";

const SECTION_LABELS: Record<string, string> = {
  profile: "پروفایل",
  trust: "اعتماد",
  devices: "دستگاه‌ها",
  phones: "شماره‌های تلفن",
  personality: "شخصیت",
  badges: "نشان‌ها",
  relations: "روابط",
  reports: "گزارش‌ها",
  moderationLogs: "سوابق نظارت",
  notifications: "اعلان‌ها",
  metrics: "شاخص‌ها",
  activity: "فعالیت",
  financial: "اطلاعات مالی",
  aiAdvice: "تحلیل هوش مصنوعی",
  images: "تصاویر",
};

export function PartialDataWarning({ errors }: { errors?: Record<string, boolean> }) {
  const failedSections = Object.keys(errors ?? {}).filter((key) => errors?.[key]);
  if (failedSections.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
    >
      بارگذاری برخی اطلاعات کامل نشده است. داده‌های زیر ممکن است ناقص باشند:{" "}
      {failedSections.map((key) => SECTION_LABELS[key] ?? key).join("، ")}.
      این وضعیت به معنی خالی بودن اطلاعات کاربر نیست.
    </div>
  );
}
