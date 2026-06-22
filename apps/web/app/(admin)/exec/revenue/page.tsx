"use client";
import { withPageProtection } from "@/components/withPageProtection";

function RevenuesPage() {
  return <div>لیست رونیوها</div>;
}

export default withPageProtection(RevenuesPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});