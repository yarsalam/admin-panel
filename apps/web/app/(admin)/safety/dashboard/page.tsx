import RiskPanel from "@/components/safety/RiskPanel";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SafetyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawUserId = params.userId;
  const userIdValue = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  const userId = Number(userIdValue);

  if (
    !userIdValue ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    return (
      <section className="mx-auto max-w-3xl space-y-3 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
        <h1 className="text-xl font-bold">داشبورد ریسک و ایمنی</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          برای مشاهدهٔ امتیاز ریسک، شناسهٔ کاربر باید مشخص باشد. در نمای ۳۶۰ کاربر
          می‌توانید اطلاعات ریسک را از زبانهٔ «Risk & AI» مشاهده کنید.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">داشبورد ریسک کاربر {userId}</h1>
      <RiskPanel userId={userId} />
    </section>
  );
}
