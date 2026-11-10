import { Suspense } from "react";
import SetPasswordForm from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">در حال بارگذاری…</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
