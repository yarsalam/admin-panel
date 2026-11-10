import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

// ─── تایپ‌های پایه ────────────────────────────────────────────────────────────

export interface ForecastPoint {
  date: string;
  revenue: number;
  confidence: [number, number] | null;
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

export type RevenueCurrency = "IRT" | "USDT" | "BTC" | "USD";

export interface MrrData {
  currency: RevenueCurrency;
  unit: string;
  mrr: number | null;
  arr: number | null;
  mrrGrowth: number | null;
  mrrHistory: { month: string; mrr: number }[];
  recurringRevenueAvailable: boolean;
  grossRevenue30d: number;
  walletDeposits30d?: number;
  walletDebits30d?: number;
  grossSales30d?: number;
  fulfilledPurchaseCount30d?: number;
  depositCurrency?: RevenueCurrency;
  depositUnit?: string;
  activeVipUsers: number;
  limitation?: string;
}

export interface ProductRevenueRow {
  product: string;
  revenue: number;
  share: number;
  transactionCount: number;
  payingUsers?: number;
  fulfilledRevenue?: number;
  fulfilledPurchaseCount?: number;
  fulfilledPayingUsers?: number;
}

export interface GenderRevenueData {
  currency: RevenueCurrency;
  unit: string;
  periodDays: number;
  source: string;
  genderBasis: string;
  fulfilledPurchaseGenderBasis?: string;
  fulfilledPurchaseLegacyGenderFallbackCount?: number;
  fulfilledPurchaseSnapshotCoveragePercent?: number | null;
  walletDebitGenderBasis?: string;
  walletDepositGenderBasis?: string;
  purchaseSource?: string;
  fulfilledPurchaseSource?: string;
  depositSource?: string;
  depositCurrency: RevenueCurrency;
  depositUnit: string;
  male: { revenue: number; payingUsers: number; paymentCount: number; arppu: number; fulfilledRevenue: number; fulfilledPurchaseCount: number; fulfilledPayingUsers: number; depositRevenue: number; depositingUsers: number; depositCount: number };
  female: { revenue: number; payingUsers: number; paymentCount: number; arppu: number; fulfilledRevenue: number; fulfilledPurchaseCount: number; fulfilledPayingUsers: number; depositRevenue: number; depositingUsers: number; depositCount: number };
  unknown: { revenue: number; payingUsers: number; paymentCount: number; arppu: number; fulfilledRevenue: number; fulfilledPurchaseCount: number; fulfilledPayingUsers: number; depositRevenue: number; depositingUsers: number; depositCount: number };
  total: { revenue: number; payingUsers: number; paymentCount: number; fulfilledRevenue: number; fulfilledPurchaseCount: number; fulfilledPayingUsers: number; depositRevenue: number; depositingUsers: number; depositCount: number };
}

export interface ArppuData {
  currency: RevenueCurrency;
  unit: string;
  depositCurrency: RevenueCurrency;
  depositUnit: string;
  periodDays: number;
  totalRevenue: number;
  paymentCount: number;
  arppu: number;
  payingUsers: number;
  activeUsers: number;
  payingRate: number;
  depositRevenue: number;
  depositCount: number;
  depositingUsers: number;
  fulfilledRevenue?: number;
  fulfilledPurchaseCount?: number;
  fulfilledPayingUsers?: number;
  fulfilledArppu?: number | null;
}

export interface CohortRow {
  cohort: string;
  users: number;
  revenue30d: number | null;
  revenue60d: number | null;
  revenue90d: number | null;
  revenue180d: number | null;
  matureDays?: number[];
  ageDays?: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  revenue: number;
  conversionRate: number;
}

export interface ChurnRevenueData {
  revenueMetricsAvailable: boolean;
  lostRevenue: number | null;
  recoveredRevenue: number | null;
  expansionRevenue: number | null;
  netRevenueRetention: number | null;
  activeVipUsers?: number;
  recentlyExpiredVipUsers?: number;
  usersWithVipHistory?: number;
  expiryRate?: number;
  limitation?: string;
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
  dataAvailable: boolean;
  currency: RevenueCurrency;
  mape: number | null;
  rmse: number | null;
  evaluationMethod?: string;
  evaluationSamples?: number;
  reason?: string;
  lastEvaluatedAt: string;
  history: { date: string; predicted: number; actual: number; error: number }[];
}

// ─── هوک‌های موجود (اصلاح‌شده) ───────────────────────────────────────────────

export const useRevenueForecast = (days: number = 90, currency: RevenueCurrency = "IRT") =>
  useQuery<RevenueForecast>({
    queryKey: ["exec", "revenue", "forecast", days, currency],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/exec/revenue/forecast?days=${days}&currency=${currency}`,
      );
      return {
        ...data,
        forecast: (Array.isArray(data.forecast) ? data.forecast : []).map(
          (point: Record<string, unknown>) => {
            const revenueValue = Number(point.revenue ?? point.predicted ?? 0);
            const confidenceValue = point.confidence;
            const confidence: [number, number] | null =
              Array.isArray(confidenceValue) &&
              confidenceValue.length === 2 &&
              confidenceValue.every(
                (value) => typeof value === "number" && Number.isFinite(value),
              )
                ? [confidenceValue[0] as number, confidenceValue[1] as number]
                : null;

            return {
              date: String(point.date ?? ""),
              revenue: Number.isFinite(revenueValue) ? revenueValue : 0,
              confidence,
            };
          },
        ),
        growthRate:
          typeof data.growthRate === "number" && Number.isFinite(data.growthRate)
            ? data.growthRate
            : null,
        peakDays: data.peakDays ?? [],
        alerts: data.alerts ?? [],
      } satisfies RevenueForecast;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useAnomalies = (currency: RevenueCurrency = "IRT") =>
  useQuery<Anomaly[]>({
    queryKey: ["exec", "revenue", "anomalies", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/anomalies?currency=${currency}`);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

export const useStrategicDecisions = (currency: RevenueCurrency = "IRT") =>
  useQuery<StrategicDecision[]>({
    queryKey: ["exec", "revenue", "strategic-decisions", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/strategic-decisions?currency=${currency}`);
      return Array.isArray(data) ? data : (data?.decisions ?? []);
    },
    staleTime: 30 * 60 * 1000,
  });

/** باگ‌فیکس: مسیر از /admin-api/revenue به /exec/revenue تصحیح شد */
export const useLtvBySource = (currency: RevenueCurrency = "IRT") =>
  useQuery<LtvSourceRow[]>({
    queryKey: ["exec", "revenue", "ltv-by-source", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/ltv-by-source?currency=${currency}`);
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

// ─── هوک‌های جدید ─────────────────────────────────────────────────────────────

export const useMrr = (currency: RevenueCurrency = "IRT") =>
  useQuery<MrrData>({
    queryKey: ["exec", "revenue", "mrr", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/mrr?currency=${currency}`);
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useProductRevenue = (currency: RevenueCurrency = "IRT") =>
  useQuery<ProductRevenueRow[]>({
    queryKey: ["exec", "revenue", "by-product", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/by-product?currency=${currency}`);
      return Array.isArray(data) ? data : (data?.rows ?? []);
    },
    staleTime: 30 * 60 * 1000,
  });

export const useGenderRevenue = (currency: RevenueCurrency = "IRT") =>
  useQuery<GenderRevenueData>({
    queryKey: ["exec", "revenue", "by-gender", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/by-gender?currency=${currency}`);
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useArppu = (currency: RevenueCurrency = "IRT") =>
  useQuery<ArppuData>({
    queryKey: ["exec", "revenue", "arppu", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/arppu?currency=${currency}`);
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useCohortRevenue = (currency: RevenueCurrency = "IRT") =>
  useQuery<CohortRow[]>({
    queryKey: ["exec", "revenue", "cohort", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/cohort?currency=${currency}`);
      return Array.isArray(data) ? data : (data?.cohorts ?? []);
    },
    staleTime: 60 * 60 * 1000,
  });

export const useRevenueFunnel = (currency: RevenueCurrency = "IRT") =>
  useQuery<FunnelStep[]>({
    queryKey: ["exec", "revenue", "funnel", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/funnel?currency=${currency}`);
      return Array.isArray(data) ? data : (data?.steps ?? []);
    },
    staleTime: 30 * 60 * 1000,
  });

export const useChurnRevenue = (days = 30) =>
  useQuery<ChurnRevenueData>({
    queryKey: ["exec", "revenue", "churn", days],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/churn?days=${days}`);
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

export const useRevenueConcentration = (currency: RevenueCurrency = "IRT") =>
  useQuery<ConcentrationData>({
    queryKey: ["exec", "revenue", "concentration", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/concentration?currency=${currency}`);
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

export const useForecastAccuracy = (currency: RevenueCurrency = "IRT") =>
  useQuery<ForecastAccuracyData>({
    queryKey: ["exec", "revenue", "forecast-accuracy", currency],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exec/revenue/forecast-accuracy?currency=${currency}`);
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
