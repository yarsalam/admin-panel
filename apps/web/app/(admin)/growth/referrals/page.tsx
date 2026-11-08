"use client";

import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/shared";
import GlobalText from "@/components/ui/GlobalText";

function ReferralsPage() {
  return (
    <div className="space-y-6 p-4" dir="rtl">
      <SectionTitle>مدیریت ارجاع‌ها</SectionTitle>
      <Card className="space-y-3 p-5">
        <GlobalText as="h2" className="font-bold">
          گزارش ارجاع‌ها هنوز به نسخهٔ عملیاتی متصل نشده است
        </GlobalText>
        <GlobalText className="text-sm text-gray-600 dark:text-gray-300">
          این صفحه فعلاً برای جلوگیری از خطای مسیر پنل در دسترس است. تا زمان
          اتصال و اعتبارسنجی API گزارش ارجاع‌ها، آمار یا عملکرد ساختگی نمایش داده
          نمی‌شود.
        </GlobalText>
      </Card>
    </div>
  );
}

export default withPageProtection(ReferralsPage, {
  panelPermission: "view_growth_panel",
  itemPermissions: "edit_content",
});
