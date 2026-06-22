"use client";

import GlobalText from "./ui/GlobalText";
import { Skeleton } from "./ui/Skeleton";


interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
}

export default function DataTable<T>({ columns, data, isLoading }: DataTableProps<T>) {
  if (isLoading) return <Skeleton className="h-40" />;
  if (!data?.length) return <div className="text-center p-4 opacity-50">داده‌ای یافت نشد</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th key={String(col.accessor)} className="px-4 py-2">
                <GlobalText className="text-sm font-bold">{col.header}</GlobalText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map((col) => (
                <td key={String(col.accessor)} className="px-4 py-2">
                  <GlobalText>{String(row[col.accessor])}</GlobalText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}