"use client";
import {
  useChurnSummary,
  useAtRiskUsers,
} from "@/lib/api/exec/mutations/useUsers";
import { Card } from "./ui/shared";
import { Skeleton } from "./ui/Skeleton";
import GlobalText from "./ui/GlobalText";

export function ChurnWidget() {
  const { data: summary, isLoading } = useChurnSummary();
  const { data: atRisk } = useAtRiskUsers(0.7, 5);

  if (isLoading) return <Skeleton className="h-40" />;
  if (!summary) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">وضعیت ریزش کاربران</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4 text-center">
          <GlobalText className="text-2xl font-bold text-red-500">
            {summary.highRisk}
          </GlobalText>
          <GlobalText className="text-xs text-gray-400">ریسک بالا</GlobalText>
        </Card>
        <Card className="p-4 text-center">
          <GlobalText className="text-2xl font-bold text-amber-500">
            {summary.mediumRisk}
          </GlobalText>
          <GlobalText className="text-xs text-gray-400">ریسک متوسط</GlobalText>
        </Card>
        <Card className="p-4 text-center">
          <GlobalText className="text-2xl font-bold text-green-500">
            {summary.lowRisk}
          </GlobalText>
          <GlobalText className="text-xs text-gray-400">ریسک پایین</GlobalText>
        </Card>
      </div>

      {atRisk?.length > 0 && (
        <Card className="p-4">
          <GlobalText className="font-bold mb-2">
            کاربران در معرض ریزش
          </GlobalText>
          {atRisk.slice(0, 5).map((user: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{user.nickname || user.userId}</span>
              <span className="text-red-500">
                {Math.round(user.risk * 100)}%
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
