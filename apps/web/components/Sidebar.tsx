"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  ChevronDownIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAppTheme } from "@/app/context/ThemeContext";
import Image from "next/image";
import { panels } from "@/data/panels";
import { useAuth } from "@/app/context/AuthContext";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {},
  );
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const togglePanel = (name: string) => {
    setExpandedPanels((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const closeMobile = () => setMobileOpen(false);

  const handleLinkClick = () => {
    if (mobileOpen) closeMobile();
  };

  const hasPermission = (perm: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(perm))
      return perm.some((p) => user.permissions.includes(p));
    return user.permissions.includes(perm);
  };

  const visiblePanels = panels.filter((p) => hasPermission(p.permission));
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 right-0 z-40 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300",
          "md:translate-x-0 md:relative",
          collapsed ? "md:w-16" : "md:w-72",
          "w-72",
          mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          !mobileOpen && "md:shadow-none",
        )}
      >
        {/* هدر سایدبار (همبرگری و عنوان) */}
        <div className="flex items-center h-16 px-2 border-b border-gray-200 dark:border-gray-700 justify-between">
          <button
            onClick={() => {
              if (window.innerWidth >= 768) {
                setCollapsed(!collapsed);
              } else {
                closeMobile();
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            type="button"
            aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
          >
            {collapsed ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <XMarkIcon className="h-5 w-5" />
            )}
          </button>
          {(!collapsed || !window.matchMedia("(min-width: 768px)").matches) && (
            <div className="p-1 bg-sky-800 dark:bg-gray-100 rounded-[50%] ">
              <Image
                aria-hidden
                src="/logo.png"
                alt="yarsalam"
                width={26}
                height={26}
              />
            </div>
          )}
        </div>

        {/* منوها */}
        <nav className="flex-1 overflow-y-auto py-2">
          {visiblePanels.map((panel) => {
            const visibleItems = panel.items.filter((item) =>
              hasPermission(item.permission),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={panel.name} className="mb-1">
                {/* دکمه پنل */}
                <button
                  onClick={() => togglePanel(panel.name)}
                  className={clsx(
                    "flex w-full items-center rounded-lg  px-2 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700",
                    collapsed && "md:justify-center",
                    expandedPanels[panel.name]
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400",
                  )}
                  type="button"
                >
                  <panel.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed ||
                    !window.matchMedia("(min-width: 768px)").matches) && (
                    <>
                      <span className="mr-3 flex-1 text-right">
                        {panel.name}
                      </span>
                      <ChevronDownIcon
                        className={clsx(
                          "h-4 w-4 transition-transform",
                          expandedPanels[panel.name] && "rotate-180",
                        )}
                      />
                    </>
                  )}
                </button>

                {/* زیرمنوها */}
                {expandedPanels[panel.name] &&
                  (!collapsed ||
                    !window.matchMedia("(min-width: 768px)").matches) && (
                    <div className="mr-4 mt-1 space-y-1">
                      {visibleItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={clsx(
                            "flex items-center rounded-lg px-3 py-2 text-sm",
                            pathname === item.href
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          <span className="flex-1 text-right">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}

                {/* بج در حالت جمع‌شده (دسکتاپ) */}
                {collapsed &&
                  window.innerWidth >= 768 &&
                  visibleItems.some((item) => item.badge) && (
                    <div className="flex justify-center -mt-1">
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {visibleItems.reduce(
                          (sum, item) => sum + (item.badge || 0),
                          0,
                        )}
                      </span>
                    </div>
                  )}
              </div>
            );
          })}

          {/* دکمه تغییر تم */}
          <button
            onClick={toggleTheme}
            className={clsx(
              "flex w-full items-center rounded-lg  px-2 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400",
              collapsed && "md:justify-center",
            )}
            type="button"
          >
            {theme.name === "روشن" ? (
              <MoonIcon className="h-5 w-5 flex-shrink-0" />
            ) : (
              <SunIcon className="h-5 w-5 flex-shrink-0" />
            )}
            {(!collapsed ||
              !window.matchMedia("(min-width: 768px)").matches) && (
              <span className="mr-3 flex-1 text-right">
                {theme.name === "روشن" ? "تاریک" : "روشن"}
              </span>
            )}
          </button>

          {/* دکمهٔ خروج */}
          <button
            onClick={logout}
            className={clsx(
              "flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400",
              collapsed && "md:justify-center",
            )}
            type="button"
          >
            <PowerIcon className="h-5 w-5 flex-shrink-0" />
            {(!collapsed ||
              !window.matchMedia("(min-width: 768px)").matches) && (
              <span className="mr-3 flex-1 text-right">خروج</span>
            )}
          </button>
        </nav>
      </aside>
    </>
  );
}
