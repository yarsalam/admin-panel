"use client";

// ─── External ────────────────────────────────────────────────────────────────
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ─── Internal ────────────────────────────────────────────────────────────────
import { useAppTheme } from "@/app/context/ThemeContext";
import { withPageProtection } from "@/components/withPageProtection";
import { useFullDashboard } from "@/lib/api/exec/queries/useFullDashboard";
import { useKpiDeltas } from "@/lib/api/exec/queries/useKpiDeltas";
import { SeoSummaryCard } from "@/components/seo/SeoSummaryCard";
import { ChurnWidget } from "@/components/ChurnWidget";

// ═══════════════ Colors ═══════════════
const C = {
  ok: "#10b981",
  warn: "#f59e0b",
  crit: "#f43f5e",
  accent: "#818cf8",
  female: "#f472b6",
  male: "#38bdf8",
  gold: "#fbbf24",
  neutral: "#6b7280",
} as const;

// ═══════════════ Theme Hook ═══════════════
function useDS() {
  const { theme } = useAppTheme();
  const isDark = theme.name === "تاریک";
  return {
    bg: theme.colors.background,
    surface: theme.colors.card,
    border: theme.colors.border,
    text: isDark ? "#f1f5f9" : "#0f172a",
    muted: isDark ? "#efefef" : "#64748b",
    dim: isDark ? "#4a5568" : "#94a3b8",
    elevated: isDark ? "#1e2130" : "#f8fafc",
    isDark,
  };
}

// ═══════════════ Small Sample Helper ═══════════════
const SMALL_SAMPLE_THRESHOLD = 50;
function isSmallSample(mau: number) {
  return mau < SMALL_SAMPLE_THRESHOLD;
}
function InsufficientData({ msg = "داده کافی نیست" }: { msg?: string }) {
  const ds = useDS();
  return (
    <p className="text-xs py-2" style={{ color: ds.dim }}>
      {msg}
    </p>
  );
}

// ═══════════════ Atoms ═══════════════
function Card({
  children,
  accent,
  className = "",
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  const ds = useDS();
  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${className}`}
      style={{ background: ds.surface, border: `1px solid ${ds.border}` }}
    >
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: accent }}
        />
      )}
      {children}
    </div>
  );
}

function Divider() {
  const ds = useDS();
  return <div className="my-4 h-px" style={{ background: ds.border }} />;
}

function SectionLabel({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const ds = useDS();
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="text-[10px] font-semibold uppercase tracking-[.14em] whitespace-nowrap"
        style={{ color: color ?? ds.muted }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: ds.border }} />
    </div>
  );
}

function Skeleton({ className = "h-32" }: { className?: string }) {
  const ds = useDS();
  return (
    <div
      className={`rounded-2xl animate-pulse ${className}`}
      style={{ background: ds.border }}
    />
  );
}

// ═══════════════ KPI Atoms ═══════════════
function Delta({
  value,
  inverted = false,
  size = "md",
}: {
  value?: number | null;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  if (value == null) return null;
  const eff = inverted ? -value : value;
  const color = eff > 0 ? C.ok : eff < 0 ? C.crit : C.neutral;
  const arrow = eff > 0 ? "▲" : eff < 0 ? "▼" : "—";
  const sizes = { sm: "text-[10px]", md: "text-[12px]", lg: "text-[14px]" };
  return (
    <span className={`${sizes[size]} font-bold`} style={{ color }}>
      {arrow} {Math.abs(value)}٪
    </span>
  );
}

function HeroKPI({
  label,
  value,
  delta,
  target,
  color,
  inverted,
  score,
  outOf,
}: {
  label: string;
  value: string;
  delta?: number | null;
  target?: string;
  color?: string;
  inverted?: boolean;
  score?: number;
  outOf?: number;
}) {
  const ds = useDS();
  return (
    <Card accent={color} className="p-5 flex flex-col gap-3">
      <span
        className="text-[10px] font-semibold uppercase tracking-[.13em]"
        style={{ color: ds.muted }}
      >
        {label}
      </span>
      <div>
        <div
          className="text-[34px] font-bold leading-none tabular-nums"
          style={{ color: color ?? ds.text }}
        >
          {value}
        </div>
        {score != null && outOf != null && (
          <div className="mt-1.5 text-[12px]">
            <span className="font-bold" style={{ color }}>
              {score}
            </span>
            <span style={{ color: ds.dim }}> / {outOf}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Delta value={delta} inverted={inverted} size="md" />
        {target && (
          <span className="text-[10px]" style={{ color: ds.dim }}>
            هدف: {target}
          </span>
        )}
      </div>
    </Card>
  );
}

function MidKPI({
  label,
  value,
  delta,
  color,
  inverted,
}: {
  label: string;
  value: string;
  delta?: number | null;
  color?: string;
  inverted?: boolean;
}) {
  const ds = useDS();
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] uppercase tracking-[.1em]"
        style={{ color: ds.muted }}
      >
        {label}
      </span>
      <span
        className="text-[22px] font-bold tabular-nums leading-none"
        style={{ color: color ?? ds.text }}
      >
        {value}
      </span>
      <Delta value={delta} inverted={inverted} size="sm" />
    </div>
  );
}

// ═══════════════ Visual Molecules ═══════════════
function ScoreRing({ score, size = 150 }: { score: number; size?: number }) {
  const ds = useDS();
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? C.ok : score >= 50 ? C.warn : C.crit;
  const cx = size / 2,
    cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`${color}18`}
        strokeWidth={10}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${(circ * score) / 100} ${circ}`}
        strokeDashoffset={circ / 4}
      />
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.18}
        fontWeight="700"
        fontFamily="monospace"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        fill={ds.muted}
        fontSize={size * 0.085}
      >
        از ۱۰۰
      </text>
    </svg>
  );
}

function BarMeter({
  label,
  value,
  target,
  color,
  max = 100,
}: {
  label: string;
  value: number;
  target?: number;
  color?: string;
  max?: number;
}) {
  const ds = useDS();
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = color ?? (target != null && value >= target ? C.ok : C.warn);
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[11px]" style={{ color: ds.muted }}>
          {label}
        </span>
        <span
          className="text-[12px] font-bold tabular-nums"
          style={{ color: barColor }}
        >
          {value}٪
          {target != null && (
            <span className="text-[10px] font-normal" style={{ color: ds.dim }}>
              {" "}
              / {target}٪
            </span>
          )}
        </span>
      </div>
      <div
        className="h-[5px] rounded-full overflow-hidden"
        style={{ background: ds.border }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function GenderBar({ ratio }: { ratio: number }) {
  const ds = useDS();
  const danger = ratio < 25;
  const gap = 35 - ratio;
  return (
    <div>
      <div className="flex justify-between text-[12px] font-semibold mb-2">
        <span style={{ color: C.female }}>زن {ratio}٪</span>
        <span style={{ color: C.male }}>مرد {100 - ratio}٪</span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ background: ds.border }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${ratio}%`, background: danger ? C.crit : C.female }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-1.5">
        <span style={{ color: danger ? C.crit : ds.muted }}>
          {danger ? `⚠ بحرانی — کمبود ${gap}٪` : `فاصله: −${gap}٪`}
        </span>
        <span style={{ color: ds.dim }}>هدف ۳۵٪</span>
      </div>
    </div>
  );
}

function Sparkline({
  data,
  color = C.accent,
  height = 56,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id={`spGrad-${color.replace("#", "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spGrad-${color.replace("#", "")})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DatingHealthRadar({
  matchHealth,
  retention,
  femaleMetrics,
}: {
  matchHealth: any;
  retention: any;
  femaleMetrics: any;
}) {
  const ds = useDS();
  const femRatio = femaleMetrics?.femaleRatio ?? 0;
  const d30 = retention?.d30 ?? 0;
  const radarData = [
    {
      metric: "نسبت زنان",
      value: Math.min(100, Math.round((femRatio / 35) * 100)),
    },
    {
      metric: "Match Rate",
      value: Math.min(100, (matchHealth?.matchRate?.current ?? 0) * 7),
    },
    { metric: "مکالمه", value: matchHealth?.conversationRate?.current ?? 0 },
    { metric: "پاسخ‌دهی", value: matchHealth?.replyRate?.current ?? 0 },
    { metric: "Anti-Ghost", value: 100 - (matchHealth?.ghostingRate ?? 0) },
    {
      metric: "Retention D30",
      value: Math.min(100, Math.round((d30 / 25) * 100)),
    },
  ];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart
        data={radarData}
        margin={{ top: 8, right: 30, bottom: 8, left: 30 }}
      >
        <PolarGrid stroke={ds.border} />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fontSize: 11, fill: ds.muted, fontFamily: "inherit" }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke={C.female}
          fill={C.female}
          fillOpacity={0.13}
          strokeWidth={2}
          dot={{ fill: C.female, r: 3, strokeWidth: 0 } as any}
        />
        <Tooltip
          contentStyle={{
            background: ds.surface,
            border: `1px solid ${ds.border}`,
            borderRadius: 10,
            fontSize: 12,
            color: ds.text,
          }}
          formatter={(v: any) => [`${Math.round(v)}`, ""]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function FunnelRow({ step, i, max }: { step: any; i: number; max: number }) {
  const ds = useDS();
  const pct = max > 0 ? Math.round((step.count / max) * 100) : 0;
  const convColor =
    (step.dropRate ?? 0) > 50
      ? C.crit
      : (step.dropRate ?? 0) > 30
        ? C.warn
        : C.ok;
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span
        className="text-[10px] w-[80px] text-right shrink-0"
        style={{ color: ds.muted }}
      >
        {step.label}
      </span>
      <div
        className="flex-1 h-7 rounded-lg overflow-hidden relative"
        style={{ background: ds.border }}
      >
        <div
          className="h-full rounded-lg transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: step.isBottleneck ? `${C.crit}88` : `${C.accent}66`,
          }}
        />
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums"
          style={{ color: ds.text }}
        >
          {step.count.toLocaleString("fa-IR")}
        </span>
      </div>
      <div className="w-[38px] text-right shrink-0">
        {i > 0 && step.conversionFromPrevious != null && (
          <span className="text-[11px] font-bold" style={{ color: convColor }}>
            {step.conversionFromPrevious}٪
          </span>
        )}
      </div>
    </div>
  );
}

function RecRow({ rec }: { rec: any }) {
  const ds = useDS();
  const prioColor =
    rec.priority === "critical"
      ? C.crit
      : rec.priority === "high"
        ? C.warn
        : C.accent;
  const prioLabel =
    rec.priority === "critical"
      ? "بحرانی"
      : rec.priority === "high"
        ? "بالا"
        : "متوسط";
  return (
    <div
      className="flex items-start gap-3 py-3.5 border-b last:border-0"
      style={{ borderColor: ds.border }}
    >
      <span
        className="shrink-0 text-[9px] font-bold px-2 py-1 rounded-full mt-0.5 uppercase"
        style={{ background: `${prioColor}18`, color: prioColor }}
      >
        {prioLabel}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-medium leading-tight"
          style={{ color: ds.text }}
        >
          {rec.title}
        </p>
        <p
          className="text-[11px] mt-1 leading-relaxed"
          style={{ color: ds.muted }}
        >
          {rec.action}
        </p>
      </div>
      {rec.impactLabel && (
        <span
          className="shrink-0 text-[11px] font-bold"
          style={{ color: C.ok }}
        >
          {rec.impactLabel}
        </span>
      )}
    </div>
  );
}

function AlertBanner({
  type,
  title,
  detail,
}: {
  type: "critical" | "warning";
  title: string;
  detail?: string;
}) {
  const ds = useDS();
  const color = type === "critical" ? C.crit : C.warn;
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: `${color}12`, border: `1px solid ${color}35` }}
    >
      <span className="shrink-0 mt-0.5">
        {type === "critical" ? "🔴" : "🟡"}
      </span>
      <div>
        <p className="text-[13px] font-semibold" style={{ color }}>
          {title}
        </p>
        {detail && (
          <p
            className="text-[11px] mt-0.5 leading-relaxed"
            style={{ color: ds.muted }}
          >
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Section Panels ═══════════════

function HeroSection({ data, deltas }: { data: any; deltas: any }) {
  const ds = useDS();
  const scoreAvailable = data?.businessScore?.dataStatus === "available";
  const scoreTotal = scoreAvailable ? (data?.businessScore?.total ?? 0) : 0;
  const breakdown = scoreAvailable ? (data?.businessScore?.breakdown ?? {}) : {};
  const northStar = data?.northStar?.meaningfulConversations ?? 0;
  const femRatio = data?.femaleMetrics?.femaleRatio ?? 0;
  const d30 = data?.retention?.d30 ?? 0;
  const ghosting = data?.matchHealth?.ghostingRate ?? 0;
  const mrrDelta = data?.revenue?.mrrDelta ?? 0;
  const scoreColor = !scoreAvailable
    ? C.neutral
    : scoreTotal >= 70
      ? C.ok
      : scoreTotal >= 50
        ? C.warn
        : C.crit;

  const breakdownConfig = [
    {
      key: "femaleHealth",
      label: "سلامت زنان",
      color: C.female,
      weight: "30٪",
    },
    { key: "matching", label: "Match", color: C.accent, weight: "25٪" },
    { key: "retention", label: "Retention", color: C.ok, weight: "20٪" },
    { key: "revenue", label: "درآمد", color: C.gold, weight: "15٪" },
    { key: "safety", label: "ایمنی", color: C.male, weight: "10٪" },
  ];

  const sparkTrend = [
    northStar * 0.6,
    northStar * 0.72,
    northStar * 0.78,
    northStar * 0.84,
    northStar * 0.91,
    northStar * 0.96,
    northStar,
  ];

  const narratives = (scoreAvailable ? [
    mrrDelta > 0 && {
      icon: "📈",
      text: `درآمد ${mrrDelta}٪ رشد کرده`,
      color: C.ok,
    },
    mrrDelta < 0 && {
      icon: "📉",
      text: `درآمد ${Math.abs(mrrDelta)}٪ افت کرده`,
      color: C.crit,
    },
    femRatio < 25 && {
      icon: "🚨",
      text: `نسبت زنان ${femRatio}٪ — ${35 - femRatio}٪ زیر هدف بحرانی`,
      color: C.crit,
    },
    d30 < 25 && {
      icon: "⚠️",
      text: `Retention D30 روی ${d30}٪ — پایین‌تر از هدف ۲۵٪`,
      color: C.warn,
    },
    ghosting > 45 && {
      icon: "👻",
      text: `Ghosting ${ghosting}٪ — بزرگ‌ترین گلوگاه`,
      color: C.crit,
    },
    data?.femaleMetrics?.newFemaleThisWeek > 0 && {
      icon: "👩",
      text: `+${data.femaleMetrics.newFemaleThisWeek} کاربر زن جدید این هفته`,
      color: C.female,
    },
  ] : []).filter(Boolean) as { icon: string; text: string; color: string }[];

  const alerts = scoreAvailable
    ? [
        ...(data?.alerts ?? []).filter(
          (a: any) => a.severity === "critical" || a.type === "critical",
        ),
        ...(data?.alerts ?? []).filter(
          (a: any) => a.severity === "warning" || a.type === "warning",
        ),
      ].slice(0, 3)
    : [];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-3">
        <Card accent={scoreColor} className="p-5 h-full">
          <SectionLabel color={scoreColor}>Business Health Score</SectionLabel>
          <div className="flex flex-col items-center gap-4">
            {scoreAvailable ? (
              <ScoreRing score={scoreTotal} size={150} />
            ) : (
              <div className="min-h-[150px] w-full flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-lg font-bold" style={{ color: ds.muted }}>
                  داده کافی نیست
                </span>
                <p className="text-xs leading-6" style={{ color: ds.dim }}>
                  تا ثبت فعالیت واقعی کاربران، امتیاز سلامت کسب‌وکار قابل محاسبه نیست.
                </p>
              </div>
            )}
            {scoreAvailable && deltas?.total?.delta != null && (
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    (deltas?.total?.delta ?? 0) > 0
                      ? C.ok
                      : (deltas?.total?.delta ?? 0) < 0
                        ? C.crit
                        : ds.dim,
                }}
              >
                {(deltas?.total?.delta ?? 0) > 0
                  ? "↑"
                  : (deltas?.total?.delta ?? 0) < 0
                    ? "↓"
                    : "—"}{" "}
                {Math.abs(deltas?.total?.delta ?? 0)} این هفته
              </span>
            )}
            <div className="w-full space-y-2.5">
              {scoreAvailable && breakdownConfig.map(({ key, label, color, weight }) => {
                const subDelta = (deltas as any)?.[key]?.delta;
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px]" style={{ color: ds.muted }}>
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[13px] font-bold tabular-nums"
                          style={{ color }}
                        >
                          {breakdown[key] ?? 0}
                        </span>
                        {subDelta != null && (
                          <span
                            className="text-[10px] font-medium"
                            style={{
                              color:
                                subDelta > 0
                                  ? C.ok
                                  : subDelta < 0
                                    ? C.crit
                                    : ds.dim,
                            }}
                          >
                            {subDelta > 0 ? "↑" : "↓"} {Math.abs(subDelta)}
                          </span>
                        )}
                        <span className="text-[9px]" style={{ color: ds.dim }}>
                          وزن {weight}
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-[4px] rounded-full overflow-hidden"
                      style={{ background: ds.border }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${breakdown[key] ?? 0}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
        <Card accent={C.accent} className="p-5">
          <div className="flex items-end gap-6">
            <div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[.15em] block mb-2"
                style={{ color: ds.muted }}
              >
                North Star — Meaningful Conversations
              </span>
              <div
                className="text-[48px] font-bold tabular-nums leading-none"
                style={{ color: C.accent }}
              >
                {scoreAvailable ? northStar.toLocaleString("fa-IR") : "—"}
              </div>
              <p className="text-[11px] mt-2" style={{ color: ds.muted }}>
                مکالمه با بیش از ۳ پیام متقابل — ۳۰ روز اخیر
              </p>
            </div>
            <div className="flex-1">
              {scoreAvailable ? (
                <Sparkline data={sparkTrend} color={C.accent} height={60} />
              ) : (
                <p className="text-xs text-center py-5" style={{ color: ds.dim }}>
                  نمودار پس از ثبت داده‌های واقعی فعال می‌شود.
                </p>
              )}
            </div>
          </div>
        </Card>

        {narratives.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: `${C.neutral}08`,
              border: `1px solid ${ds.border}`,
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[.14em] block mb-3"
              style={{ color: ds.dim }}
            >
              📋 خلاصه اجرایی — این هفته
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {narratives.slice(0, 4).map((n, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5">{n.icon}</span>
                  <span
                    className="text-[12px] leading-relaxed"
                    style={{ color: n.color }}
                  >
                    {n.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a: any, i: number) => (
              <AlertBanner
                key={i}
                type={a.severity ?? a.type}
                title={a.title ?? a.message}
                detail={a.detail}
              />
            ))}
          </div>
        )}
        {!scoreAvailable && (
          <Card accent={C.neutral} className="p-5">
            <p className="text-sm text-center py-3" style={{ color: ds.muted }}>
              هنوز داده عملیاتی در پایگاه داده وجود ندارد؛ نمایش هشدار یا امتیاز سلامت در این وضعیت قابل اتکا نیست.
            </p>
          </Card>
        )}
        {scoreAvailable && alerts.length === 0 && narratives.length === 0 && (
          <Card accent={C.ok} className="p-5">
            <p className="text-sm text-center py-3" style={{ color: ds.muted }}>
              ✅ همه چیز در وضعیت عادی است
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function KpiRow({ data, deltas }: { data: any; deltas: any }) {
  const femRatio = data?.femaleMetrics?.femaleRatio ?? 0;
  const northStar = data?.northStar?.meaningfulConversations ?? 0;
  const d30 = data?.retention?.d30 ?? 0;
  const mrr = data?.revenue?.mrr ?? 0;
  const ghosting = data?.matchHealth?.ghostingRate ?? 0;
  const conv = data?.revenue?.conversionRate ?? 0;
  const mau = data?.growth?.mau?.current ?? 0;
  const small = isSmallSample(mau);

  return (
    <div>
      <SectionLabel>شاخص‌های کلیدی نتیجه — Outcome KPIs</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <HeroKPI
          label="Female Ratio"
          value={`${femRatio}٪`}
          delta={deltas?.femaleRatioPct?.delta}
          target="۳۵٪"
          color={femRatio < 20 ? C.crit : femRatio < 30 ? C.warn : C.female}
          score={femRatio}
          outOf={35}
        />
        <HeroKPI
          label="Meaningful Conversations"
          value={northStar.toLocaleString("fa-IR")}
          delta={deltas?.dau?.delta}
          target="۵۰۰"
          color={C.accent}
          score={northStar}
          outOf={500}
        />
        <HeroKPI
          label="D30 Retention"
          value={small ? "—" : `${d30}٪`}
          delta={small ? null : deltas?.retentionD30Pct?.delta}
          target={small ? "داده ناکافی" : "۲۵٪"}
          color={small ? C.neutral : d30 >= 25 ? C.ok : C.warn}
          score={small ? undefined : d30}
          outOf={small ? undefined : 25}
        />
        <HeroKPI
          label="MRR"
          value={`${(mrr / 1_000_000).toFixed(1)}M`}
          delta={deltas?.mrr?.delta}
          target="۶M"
          color={C.ok}
          score={Math.round((mrr / 6_000_000) * 100)}
          outOf={100}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <HeroKPI
          label="Ghosting Rate"
          value={ghosting === -1 ? "—" : `${ghosting}٪`}
          delta={ghosting === -1 ? null : deltas?.ghostingRatePct?.delta}
          target={ghosting === -1 ? "داده ناکافی" : "زیر ۴۰٪"}
          color={ghosting === -1 ? C.neutral : ghosting > 45 ? C.crit : C.ok}
          inverted
          score={ghosting === -1 ? undefined : ghosting}
          outOf={ghosting === -1 ? undefined : 40}
        />
        <HeroKPI
          label="Premium Conversion"
          value={`${conv}٪`}
          delta={deltas?.premiumConversionPct?.delta}
          target="۵٪"
          color={conv >= 5 ? C.ok : C.warn}
          score={Math.round((conv / 5) * 100)}
          outOf={100}
        />
      </div>
    </div>
  );
}

function MetricsSection({ data, deltas }: { data: any; deltas: any }) {
  const ds = useDS();
  const { growth, retention, revenue, matchHealth, femaleMetrics } = data ?? {};
  const mrr = revenue?.mrr ?? 0;
  const conv = revenue?.conversionRate ?? 0;
  const d30 = retention?.d30 ?? 0;
  const mau = growth?.mau?.current ?? 0;
  const small = isSmallSample(mau);

  return (
    <div>
      <SectionLabel>معیارهای اصلی کسب‌وکار</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card accent={C.accent} className="p-5">
          <SectionLabel color={C.warn}>رشد کاربران</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-5">
            <MidKPI
              label="DAU"
              value={(growth?.dau?.current ?? 0).toLocaleString("fa-IR")}
              delta={deltas?.dau?.delta}
              color={C.accent}
            />
            <MidKPI
              label="MAU"
              value={(growth?.mau?.current ?? 0).toLocaleString("fa-IR")}
              delta={deltas?.mau?.delta}
            />
            <MidKPI
              label="DAU/MAU"
              value={`${growth?.dauMauRatio ?? 0}٪`}
              color={(growth?.dauMauRatio ?? 0) >= 20 ? C.ok : C.warn}
            />
            <MidKPI
              label="امروز"
              value={(growth?.newUsersToday ?? 0).toLocaleString("fa-IR")}
              color={C.ok}
            />
          </div>
          <Divider />
          <SectionLabel color={ds.dim}>Retention Cohorts</SectionLabel>
          {small ? (
            <InsufficientData msg="حجم داده برای Retention کافی نیست (MAU < ۵۰)" />
          ) : (
            <>
              <BarMeter
                label="D7 کل"
                value={retention?.d7 ?? 0}
                target={45}
                color={C.accent}
              />
              <BarMeter
                label="D30 کل"
                value={d30}
                target={25}
                color={C.accent}
              />
              <BarMeter
                label="D30 زنان"
                value={retention?.femaleD30 ?? 0}
                color={C.female}
              />
              <BarMeter
                label="D30 مردان"
                value={retention?.maleD30 ?? 0}
                color={C.male}
              />
              <BarMeter
                label="D30 Premium"
                value={retention?.premiumD30 ?? 0}
                color={C.gold}
              />
            </>
          )}
        </Card>

        <Card accent={C.ok} className="p-5">
          <SectionLabel color={C.ok}>درآمد</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-5">
            <MidKPI
              label="MRR"
              value={`${(mrr / 1_000_000).toFixed(1)}M`}
              delta={deltas?.mrr?.delta}
              color={C.ok}
            />
            <MidKPI
              label="تبدیل Premium"
              value={`${conv}٪`}
              delta={deltas?.premiumConversionPct?.delta}
              color={conv >= 5 ? C.ok : C.warn}
            />
            <MidKPI
              label="ARPU"
              value={`${Math.round((revenue?.arpu ?? 0) / 1000)}K`}
              delta={deltas?.arpu?.delta}
            />
            {revenue?.churnRate != null ? (
              <MidKPI
                label="Churn"
                value={`${revenue.churnRate}٪`}
                delta={deltas?.churnRate?.delta}
                inverted
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[.1em]"
                  style={{ color: ds.muted }}
                >
                  Churn
                </span>
                <span
                  className="text-[22px] font-bold"
                  style={{ color: ds.dim }}
                >
                  —
                </span>
                <span className="text-[10px]" style={{ color: ds.dim }}>
                  به‌زودی
                </span>
              </div>
            )}
          </div>
          <Divider />
          <div className="flex justify-between items-baseline mb-5">
            <span className="text-[11px]" style={{ color: ds.muted }}>
              جمع این ماه
            </span>
            <span
              className="text-[20px] font-bold tabular-nums"
              style={{ color: C.ok }}
            >
              {((revenue?.totalThisMonth ?? 0) / 1_000_000).toFixed(1)}M تومان
            </span>
          </div>
          <SectionLabel color={ds.dim}>Match Health</SectionLabel>
          {small ? (
            <InsufficientData msg="داده کافی برای Match Health نیست" />
          ) : (
            <>
              <BarMeter
                label="Match Rate"
                value={matchHealth?.matchRate?.current ?? 0}
                max={20}
                color={C.accent}
              />
              <BarMeter
                label="Conversation Rate"
                value={matchHealth?.conversationRate?.current ?? 0}
                color={C.ok}
              />
              <BarMeter
                label="Reply Rate"
                value={matchHealth?.replyRate?.current ?? 0}
                color={C.accent}
              />
              <BarMeter
                label="Ghosting Rate"
                value={matchHealth?.ghostingRate ?? 0}
                target={40}
                color={C.crit}
              />
            </>
          )}
        </Card>

        <Card accent={C.female} className="p-5">
          <SectionLabel color={C.female}>سلامت دیتینگ</SectionLabel>
          <DatingHealthRadar
            matchHealth={matchHealth}
            retention={retention}
            femaleMetrics={femaleMetrics}
          />
          <div className="grid grid-cols-2 gap-1 mt-2 mb-3 text-[9px]">
            {[
              { l: "Match Rate", d: deltas?.matchRate?.delta },
              { l: "Conversation", d: deltas?.conversationRate?.delta },
              { l: "Reply", d: deltas?.replyRate?.delta },
              {
                l: "Ghosting",
                d: deltas?.ghostingRatePct?.delta,
                invert: true,
              },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-1">
                <span style={{ color: ds.muted }}>{m.l}:</span>
                {m.d != null ? (
                  <span
                    style={{
                      color: m.invert
                        ? m.d > 0
                          ? C.crit
                          : C.ok
                        : m.d > 0
                          ? C.ok
                          : C.crit,
                    }}
                  >
                    {m.d > 0 ? "↑" : "↓"} {Math.abs(m.d)}٪
                  </span>
                ) : (
                  <span style={{ color: ds.dim }}>—</span>
                )}
              </div>
            ))}
          </div>
          <Divider />
          <GenderBar ratio={femaleMetrics?.femaleRatio ?? 0} />
          <Divider />
          <div className="grid grid-cols-3 gap-2 text-center my-5">
            {[
              {
                l: "کیفیت Match",
                v: `${matchHealth?.qualityScore ?? 0}/100`,
                c: (matchHealth?.qualityScore ?? 0) >= 70 ? C.ok : C.warn,
              },
              {
                l: "میانگین پیام",
                v: `${matchHealth?.avgMessagesPerMatch ?? 0}`,
                c: ds.text,
              },
              {
                l: "First Msg",
                v: `${matchHealth?.firstMessageSuccessRate ?? 0}٪`,
                c:
                  (matchHealth?.firstMessageSuccessRate ?? 0) >= 50
                    ? C.ok
                    : C.warn,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl py-2"
                style={{
                  background: `${C.female}0a`,
                  border: `1px solid ${C.female}20`,
                }}
              >
                <div
                  className="text-[16px] font-bold tabular-nums"
                  style={{ color: item.c }}
                >
                  {item.v}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: ds.muted }}>
                  {item.l}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DeepDiveSection({ data }: { data: any }) {
  const ds = useDS();
  const { funnel, growth, safety, recommendations } = data ?? {};
  const funnelSteps = funnel?.steps ?? [];
  const mau = growth?.mau?.current ?? 1;
  const bottleneck = funnelSteps.find((s: any) => s.isBottleneck);
  const overallConv =
    funnelSteps.length > 1
      ? Math.round(
          ((funnelSteps[funnelSteps.length - 1]?.count ?? 0) /
            (funnelSteps[0]?.count ?? 1)) *
            100,
        )
      : 0;

  return (
    <div>
      <SectionLabel>تحلیل عمیق</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <SectionLabel>قیف دیتینگ — ۳۰ روز</SectionLabel>
          {funnelSteps.length === 0 || funnelSteps[0]?.count === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: ds.muted }}>
                داده‌ای برای قیف ۳۰ روزه موجود نیست
              </p>
              <p className="text-xs mt-2" style={{ color: ds.dim }}>
                با افزایش کاربران فعال، قیف به‌صورت خودکار پر می‌شود
              </p>
            </div>
          ) : (
            funnelSteps.map((s: any, i: number) => (
              <FunnelRow
                key={s.step}
                step={s}
                i={i}
                max={funnelSteps[0]?.count ?? 1}
              />
            ))
          )}
          {bottleneck && (
            <div
              className="mt-3 p-3 rounded-xl text-[11px] leading-relaxed"
              style={{
                background: `${C.warn}10`,
                border: `1px solid ${C.warn}30`,
              }}
            >
              <span className="font-semibold" style={{ color: C.warn }}>
                گلوگاه اصلی:{" "}
              </span>
              <span style={{ color: ds.muted }}>
                {bottleneck.label} — افت {bottleneck.dropRate}٪
              </span>
            </div>
          )}
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-[11px]" style={{ color: ds.muted }}>
              تبدیل کل (ثبت‌نام → چت)
            </span>
            <span
              className="text-[15px] font-bold tabular-nums"
              style={{ color: C.warn }}
            >
              {overallConv}٪
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel>بخش‌های کاربری</SectionLabel>
          {[
            { l: "MAU", v: growth?.mau?.current ?? 0, c: C.ok, icon: "👥" },
            { l: "DAU", v: growth?.dau?.current ?? 0, c: C.accent, icon: "📱" },
            {
              l: "ثبت‌نام این هفته",
              v: growth?.newUsersThisWeek ?? 0,
              c: C.warn,
              icon: "🆕",
            },
            {
              l: "کاربر پرخطر",
              v: safety?.highRiskUsers ?? 0,
              c: C.crit,
              icon: "⚠️",
            },
          ].map((seg, i) => {
            const pct = Math.min(100, Math.round((seg.v / mau) * 100));
            return (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: ds.muted }}
                  >
                    <span>{seg.icon}</span>
                    {seg.l}
                  </span>
                  <span
                    className="font-bold tabular-nums"
                    style={{ color: seg.c }}
                  >
                    {seg.v.toLocaleString("fa-IR")}
                  </span>
                </div>
                <div
                  className="h-[5px] rounded-full overflow-hidden"
                  style={{ background: ds.border }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: seg.c }}
                  />
                </div>
              </div>
            );
          })}
          <Divider />
          <SectionLabel>ایمنی محیط</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                l: "گزارش امروز",
                v: safety?.reportsToday ?? 0,
                good: false,
                warnAt: 30,
              },
              {
                l: "در صف بررسی",
                v: safety?.pendingModeration ?? 0,
                good: false,
                warnAt: 15,
              },
              {
                l: "تأیید‌شده",
                v: `${Math.round(((safety?.verifiedProfiles ?? 0) / ((safety?.verifiedProfiles ?? 0) + (safety?.fakeProfiles ?? 0) || 1)) * 100)}٪`,
                good: true,
                warnAt: Infinity,
              },
              {
                l: "پروفایل جعلی",
                v: safety?.fakeProfiles ?? 0,
                good: false,
                warnAt: 20,
              },
            ].map((cell, i) => {
              const raw = typeof cell.v === "number" ? cell.v : 0;
              const color = cell.good
                ? C.ok
                : raw >= cell.warnAt
                  ? C.crit
                  : raw > 0
                    ? C.warn
                    : C.ok;
              return (
                <div
                  key={i}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: `${color}12`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <p
                    className="text-[9px] uppercase tracking-wider mb-1"
                    style={{ color: ds.muted }}
                  >
                    {cell.l}
                  </p>
                  <p
                    className="text-[18px] font-bold tabular-nums"
                    style={{ color }}
                  >
                    {typeof cell.v === "number"
                      ? cell.v.toLocaleString("fa-IR")
                      : cell.v}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel>اقدامات پیشنهادی</SectionLabel>
          {(recommendations ?? []).slice(0, 6).map((rec: any) => (
            <RecRow key={rec.id} rec={rec} />
          ))}
          {(recommendations ?? []).length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: ds.dim }}>
              پیشنهادی موجود نیست
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════ Page Root ═══════════════
function DashboardPage() {
  const ds = useDS();
  const { data, isLoading, isError } = useFullDashboard();
  const { data: deltas } = useKpiDeltas();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-3">
            <Skeleton className="h-[420px]" />
          </div>
          <div className="col-span-9 flex flex-col gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-24" />
            <Skeleton className="h-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="flex flex-col items-center justify-center h-96 gap-4"
        dir="rtl"
      >
        <span className="text-5xl">⚠️</span>
        <p className="text-sm" style={{ color: ds.muted }}>
          داده‌ها در دسترس نیستند — سرور ادمین روی ۴۰۰۰ در حال اجرا است؟
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 p-6 pb-16"
      dir="rtl"
      style={{ color: ds.text, background: ds.bg, minHeight: "100vh" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: ds.text }}>
            پنل مدیریت یارسلام
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: ds.muted }}>
            Executive Intelligence Dashboard
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: ds.elevated, border: `1px solid ${ds.border}` }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: C.ok }}
          />
          <span className="text-[11px] font-medium" style={{ color: ds.muted }}>
            Live
          </span>
        </div>
      </div>
      <HeroSection data={data} deltas={deltas} />
      <KpiRow data={data} deltas={deltas} />
      <MetricsSection data={data} deltas={deltas} />
      <DeepDiveSection data={data} />
      <ChurnWidget />
      <SeoSummaryCard />
      <div
        className="flex items-center justify-between pt-2 border-t"
        style={{ borderColor: ds.border }}
      >
        <span className="text-[10px]" style={{ color: ds.dim }}>
          یارسلام Intelligence · آپدیت هر ۵ دقیقه
        </span>
        <span className="text-[10px]" style={{ color: ds.dim }}>
          Executive Dashboard v3.0
        </span>
      </div>
    </div>
  );
}

export default withPageProtection(DashboardPage, {
  panelPermission: "view_executive_panel",
  itemPermissions: "view_analytics",
});
