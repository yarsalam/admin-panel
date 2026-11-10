"use client";

import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";

function ReferralsPage() {
  return (
    <div className="space-y-6 p-4">
      <SectionTitle>مدیریت ارجاع کاربران</SectionTitle>
      <section
        className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        role="status"
      >
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          بخش ارجاع در حال آماده‌سازی است
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          زیرساخت API کمپین‌های ارجاع وجود دارد، اما رابط مدیریتی این بخش هنوز
          تکمیل نشده است. پس از آماده شدن، آمار ارجاع‌ها و کمپین‌ها در این صفحه
          نمایش داده می‌شود.
        </p>
      </section>
    </div>
  );
}

export default withPageProtection(ReferralsPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
