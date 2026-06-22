export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      style={{ height: "2rem" }}
      className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className ?? ""}`}
    />
  );
}
