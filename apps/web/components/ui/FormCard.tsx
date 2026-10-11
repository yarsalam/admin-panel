"use client";
import GlobalText from "./GlobalText";

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({
  title,
  subtitle,
  children,
  className,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border bg-[var(--color-card)] border-[var(--color-border)] ${className}`}
      >
        {title && (
          <GlobalText as="h1" className="text-2xl font-bold text-center mb-2">
            {title}
          </GlobalText>
        )}
        {subtitle && (
          <GlobalText className="text-sm text-center mb-6 opacity-70">
            {subtitle}
          </GlobalText>
        )}
        {children}
      </div>
    </div>
  );
}
