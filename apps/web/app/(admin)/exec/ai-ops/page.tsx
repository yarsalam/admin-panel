"use client";
import { withPageProtection } from "@/components/withPageProtection";
import SectionTitle from "@/components/ui/SectionTitle";
import GlobalText from "@/components/ui/GlobalText";
import AiOpsPanel from "@/components/aiOps/AiOpsPanel";

function AiOpsPage() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <SectionTitle>مانیتورینگ کیفیت هوش مصنوعی</SectionTitle>
        <GlobalText className="text-sm text-gray-500 -mt-2">
          وضعیت زنده‌ی سرویس‌های embedding، matching و uplift — فقط متریک‌های
          واقعاً قابل‌اندازه‌گیری نمایش داده می‌شوند
        </GlobalText>
      </div>
      <AiOpsPanel />
    </div>
  );
}

export default withPageProtection(AiOpsPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
