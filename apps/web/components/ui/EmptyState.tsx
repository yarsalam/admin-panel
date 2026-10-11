import GlobalText from "./GlobalText";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "داده‌ای یافت نشد" }: EmptyStateProps) {
  return (
    <div className="text-center p-10">
      <GlobalText className="opacity-70">{message}</GlobalText>
    </div>
  );
}