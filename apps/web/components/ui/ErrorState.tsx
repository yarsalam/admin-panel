import CustomButton from "./CustomButton";
import GlobalText from "./GlobalText";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "خطا در بارگذاری اطلاعات",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center p-10">
      <GlobalText className="text-red-500 text-lg">{message}</GlobalText>
      <p className="text-sm opacity-70 mt-2">
        لطفاً اتصال به سرور را بررسی کنید.
      </p>
      {onRetry && (
        <CustomButton
          label="تلاش مجدد"
          onClick={onRetry}
          className="mt-4 px-6 !w-auto inline-block"
        />
      )}
    </div>
  );
}