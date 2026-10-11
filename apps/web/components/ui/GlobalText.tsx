import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4";
}

export default function GlobalText({
  children,
  className = "",
  as: Tag = "p",
}: Props) {
  return (
    <Tag className={`text-[var(--color-text)] ${className}`}>{children}</Tag>
  );
}
