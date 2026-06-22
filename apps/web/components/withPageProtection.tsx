"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PageProtection {
  panelPermission?: string;
  itemPermissions?: string | string[];
}

export function withPageProtection(
  Component: React.ComponentType,
  protection: PageProtection
) {
  return function ProtectedPage(props: any) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      const hasPanel = !protection.panelPermission || user.permissions.includes(protection.panelPermission);
      const hasItem = !protection.itemPermissions || (
        Array.isArray(protection.itemPermissions)
          ? protection.itemPermissions.some(p => user.permissions.includes(p))
          : user.permissions.includes(protection.itemPermissions)
      );

      if (!hasPanel || !hasItem) {
        router.replace("/unauthorized");
      }
    }, [isLoading, user, router]);
console.log("User Permissions:", user?.permissions);
console.log("Required Panel Permission:", protection.panelPermission);
console.log("Required Item Permissions:", protection.itemPermissions);
    if (isLoading || !user) return null;
    return <Component {...props} />;
  };
}