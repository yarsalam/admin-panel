"use client";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSidebar } from "@/app/context/SidebarContext";


export default function TopBar() {
  const { toggleMobile } = useSidebar();

  return (
    <div className="flex items-center h-16 px-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* دکمه همبرگری فقط در موبایل */}
      <button
        onClick={toggleMobile}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        type="button"
        aria-label="باز کردن منو"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-bold text-gray-800 dark:text-white">
        پنل مدیریت
      </h1>
      {/* می‌تونی آواتار یا دکمه‌های دیگه هم اینجا بذاری */}
    </div>
  );
}