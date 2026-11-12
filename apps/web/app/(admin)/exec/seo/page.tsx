"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withPageProtection } from '@/components/withPageProtection';

function LegacyExecutiveSeoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/growth/seo-studio');
  }, [router]);

  return <div className="p-6 text-sm text-gray-500">گزارش سئو به موتور رشد و جذب منتقل شده است.</div>;
}

export default withPageProtection(LegacyExecutiveSeoPage, {
  panelPermission: 'view_executive_panel',
  itemPermissions: 'view_analytics',
});
