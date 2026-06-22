export default function ProfileCard({ user }: { user: any }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">اطلاعات کاربر</h2>
      <div className="grid grid-cols-2 gap-3">
        <p><strong>نام:</strong> {user.nickname}</p>
        <p><strong>شهر:</strong> {user.city}</p>
        <p><strong>وضعیت:</strong> {user.status}</p>
        <p><strong>فاز:</strong> {user.phase}</p>
        <p><strong>تأیید چهره:</strong> {user.isFaceVerified ? "بله" : "خیر"}</p>
        <p><strong>تاریخ عضویت:</strong> {new Date(user.createdAt).toLocaleDateString("fa-IR")}</p>
      </div>
    </div>
  );
}