"use client";
import { withPageProtection } from "@/components/withPageProtection";

function SystemHealthPage() {
  return <div>لیست سلامتی</div>;
}

export default withPageProtection(SystemHealthPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});