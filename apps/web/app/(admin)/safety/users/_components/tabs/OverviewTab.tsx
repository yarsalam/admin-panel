"use client";
import { useState } from "react";
import ProfileCard from "@/components/safety/ProfileCard";
import {
  useFlagDevice,
  useRevokeDevice,
  useOverrideTrust,
} from "@/lib/api/safety/mutations/useUser360Actions";

export default function OverviewTab({
  userId,
  data360,
}: {
  userId: number;
  data360: any;
}) {
  const {
    profile,
    trust,
    devices = [],
    phones = [],
    personality,
    badges,
  } = data360;

  const flagDevice = useFlagDevice(userId);
  const revokeDevice = useRevokeDevice(userId);
  const overrideTrust = useOverrideTrust(userId);

  const [trustOverride, setTrustOverride] = useState(false);
  const [newScore, setNewScore] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* پروفایل */}
      <div className="md:col-span-2">
        <ProfileCard user={profile} />
      </div>

      {/* Trust */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow space-y-3">
        <h3 className="font-semibold text-sm text-gray-500">امتیاز اعتماد</h3>
        <div className="flex items-end gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {trust?.trustScore ?? "—"}
            </p>
            <p className="text-xs text-gray-400">Trust</p>
          </div>
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${(trust?.deviceRisk ?? 0) > 50 ? "text-red-500" : "text-green-500"}`}
            >
              {trust?.deviceRisk ?? "—"}
            </p>
            <p className="text-xs text-gray-400">Device Risk</p>
          </div>
        </div>
        <button
          onClick={() => setTrustOverride((v) => !v)}
          className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Override دستی
        </button>
        {trustOverride && (
          <div className="space-y-2 pt-2 border-t dark:border-gray-700">
            <input
              type="number"
              min={0}
              max={100}
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder="امتیاز (0-100)"
              className="w-full border rounded p-1.5 text-sm dark:bg-gray-700"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="دلیل"
              className="w-full border rounded p-1.5 text-sm dark:bg-gray-700"
            />
            <button
              onClick={() => {
                overrideTrust.mutate({ score: +newScore, reason });
                setTrustOverride(false);
              }}
              disabled={!newScore || !reason}
              className="w-full py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
            >
              ذخیره
            </button>
          </div>
        )}
      </div>

      {/* Badges (notification counts) */}
      {badges && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-sm text-gray-500 mb-3">
            Badge Counts
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {Object.entries(badges).map(([k, v]) => (
              <div key={k}>
                <p className="text-xl font-bold text-blue-600">{String(v)}</p>
                <p className="text-xs text-gray-500">{k}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* دستگاه‌ها */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm text-gray-500 mb-3">
          دستگاه‌ها ({devices.length})
        </h3>
        <ul className="space-y-2">
          {devices.slice(0, 5).map((d: any) => (
            <li
              key={d.id ?? d.deviceId}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${d.isFlagged ? "bg-red-500" : d.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                />
                <span className="truncate max-w-[120px]">
                  {d.model ?? d.deviceId}
                </span>
                <span className="text-xs text-gray-400">{d.platform}</span>
              </div>
              <div className="flex gap-1">
                {!d.isFlagged && (
                  <button
                    onClick={() =>
                      flagDevice.mutate({
                        deviceId: d.deviceId,
                        reason: "مشکوک - ادمین",
                      })
                    }
                    className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded"
                  >
                    Flag
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("دسترسی لغو شود؟"))
                      revokeDevice.mutate(d.deviceId);
                  }}
                  className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded"
                >
                  لغو
                </button>
              </div>
            </li>
          ))}
          {devices.length === 0 && (
            <li className="text-gray-500 text-xs">دستگاهی ثبت نشده</li>
          )}
        </ul>
      </div>

      {/* شماره‌ها */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="font-semibold text-sm text-gray-500 mb-3">
          شماره‌های تلفن ({phones.length})
        </h3>
        <ul className="space-y-2">
          {phones.map((p: any) => (
            <li
              key={p.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${p.isVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {p.isVerified ? "تأیید شده" : "تأیید نشده"}
                </span>
                <span dir="ltr">{p.phone}</span>
              </div>
              {p.isActive && (
                <span className="text-xs text-blue-500">فعال</span>
              )}
            </li>
          ))}
          {phones.length === 0 && (
            <li className="text-gray-500 text-xs">شماره‌ای ثبت نشده</li>
          )}
        </ul>
      </div>

      {/* Personality snapshot */}
      {personality?.ocean && Object.keys(personality.ocean).length > 0 && (
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-sm text-gray-500 mb-3">
            شخصیت (OCEAN)
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(personality.ocean).map(
              ([trait, val]: [string, any]) => (
                <div key={trait} className="text-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((val ?? 0.5) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{trait}</p>
                  <p className="text-xs font-medium">
                    {Math.round((val ?? 0.5) * 100)}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
