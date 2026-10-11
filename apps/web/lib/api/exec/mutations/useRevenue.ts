import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// ─── تایپ‌های پایه ────────────────────────────────────────────────────────────

export interface ForecastPoint {
  date: string;
  revenue: number;
  confidence: [number, number];
}

export interface RevenueForecast {
  forecast: ForecastPoint[];
  growthRate: number;
  peakDays: string[];
  alerts: ForecastAlert[];
}

export interface ForecastAlert {
  type: "warning" | "danger" | "info";
  message: string;
}

export interface Anomaly {
  id: string;
  date: string;
  severity: "low" | "medium" | "high";
  description: string;
  actual: number;
  expected: number;
}

export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  impact: number;
  roi: number;
}

export interface LtvSourceRow {
  source: string;
  userCount: number;
  totalRevenue: number;
  ltv: number;
  cac: number;
  paybackPeriod: number;
}

// ─── تایپ‌های جدید ────────────────────────────────────────────────────────────

export interface MrrData {
  mrr: number;
  arr: number;
  mrrGrowth: number;
  mrrHistory: { month: string; mrr: number }[];
}

export interface ProductRevenueRow {
  product: string;
  revenue: number;
  share: number;
  transactionCount: number;
}

export interface GenderRevenueData {
  male: { revenue: number; payingUsers: number; arppu: number };
  female: { revenue: number; payingUsers: number; arppu: number };
  unknown: { revenue: number; payingUsers: number; arppu: number };
}

export interface ArppuData {
  arppu: number;
  payingUsers: number;
  activeUsers: number;
  payingRate: number;
}

export interface CohortRow {
  cohort: string;
  users: number;
  revenue30d: number;
  revenue60d: number;
  revenue90d: number;
  revenue180d: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  revenue: number;
  conversionRate: number;
}

export interface ChurnRevenueData {
  lostRevenue: number;
  recoveredRevenue: number;
  expansionRevenue: number;
  netRevenueRetention: number;
  history: {
    month: string;
    lost: number;
    recovered: number;
    expansion: number;
  }[];
}

export interface ConcentrationData {
  top1pct: { users: number; revenue: number; share: number };
  top5pct: { users: number; revenue: number; share: number };
  top10pct: { users: number; revenue: number; share: number };
  giniCoefficient: number;
}

export interface ForecastAccuracyData {
  mape: number;
  rmse: number;
  lastEvaluatedAt: string;
  history: { date: string; predicted: number; actual: number; error: number }[];
}

// ─── هوک‌های موجود (اصلاح‌شده) ───────────────────────────────────────────────

export const useRevenueForecast = (days: number = 90) =>
  useQuery<RevenueForecast>({
    queryKey: ["exec", "revenue", "forecast", days],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/exec/revenue/forecast?days=${days}`,
      );
      return {
        ...data,
        forecast: (data.forecast ?? []).map((p: any) => ({
          date: p.date,
          revenue: p.revenue ?? p.predicted ?? 0,
          confidence: Array.isArray(p.confidence)
            ? p.confidence
            : [
                (p.revenue ?? p.predicted ?? 0) * 0.85,
                (p.revenue ?? p.predicted ?? 0) * 1.15,
              ],
        })),
        growthRate: data.growthRate ?? 0,
        peakDays: data.peakDays ?? [],
        alerts: data.alerts ?? [],
      } satisfies RevenueForecast;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useAnomalies = () =>
  useQuery<Anomaly[]>({
    queryKey: ["exec", "revenue", "anomalies"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/anomalies");
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

export const useStrategicDecisions = () =>
  useQuery<StrategicDecision[]>({
    queryKey: ["exec", "revenue", "strategic-decisions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/strategic-decisions");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

/** باگ‌فیکس: مسیر از /admin-api/revenue به /exec/revenue تصحیح شد */
export const useLtvBySource = () =>
  useQuery<LtvSourceRow[]>({
    queryKey: ["exec", "revenue", "ltv-by-source"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/ltv-by-source");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

// ─── هوک‌های جدید ─────────────────────────────────────────────────────────────

export const useMrr = () =>
  useQuery<MrrData>({
    queryKey: ["exec", "revenue", "mrr"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/mrr");
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useProductRevenue = () =>
  useQuery<ProductRevenueRow[]>({
    queryKey: ["exec", "revenue", "by-product"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/by-product");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useGenderRevenue = () =>
  useQuery<GenderRevenueData>({
    queryKey: ["exec", "revenue", "by-gender"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/by-gender");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useArppu = () =>
  useQuery<ArppuData>({
    queryKey: ["exec", "revenue", "arppu"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/arppu");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useCohortRevenue = () =>
  useQuery<CohortRow[]>({
    queryKey: ["exec", "revenue", "cohort"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/cohort");
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useRevenueFunnel = () =>
  useQuery<FunnelStep[]>({
    queryKey: ["exec", "revenue", "funnel"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/funnel");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useChurnRevenue = () =>
  useQuery<ChurnRevenueData>({
    queryKey: ["exec", "revenue", "churn"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/churn");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useRevenueConcentration = () =>
  useQuery<ConcentrationData>({
    queryKey: ["exec", "revenue", "concentration"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/concentration");
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useForecastAccuracy = () =>
  useQuery<ForecastAccuracyData>({
    queryKey: ["exec", "revenue", "forecast-accuracy"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/forecast-accuracy");
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
