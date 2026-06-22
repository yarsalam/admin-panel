export function ServiceStatusBadge({ status }: { status: 'up' | 'down' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${status === 'up' ? 'text-green-500' : 'text-red-500'}`}>
      <span className={`h-2 w-2 rounded-full ${status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
      {status === 'up' ? 'فعال' : 'قطعی'}
    </span>
  );
}