import { useQuery } from "@tanstack/react-query";
import apiClient from "../../client";

export interface ForecastPoint {
  date: string;
  revenue: number;
  confidence: [number, number] | null;
}

export interface RevenueForecast {
  forecast: ForecastPoint[];
  growthRate: number | null;
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
  currency?: string;
  severity: "low" | "medium" | "high";
  description: string;
  actual: number;
  expected: number;
}

export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  currency?: string;
  impact: number;
  roi?: number | null;
}

export interface LtvSourceRow {
  source: string;
  currency?: string;
  userCount: number;
  totalRevenue: number;
  ltv: number;
  cac: number | null;
  paybackPeriod: number | null;
}

export interface MrrData {
  currency: string;
  unit: string;
  mrr: number | null;
  arr: number | null;
  mrrGrowth: number | null;
  mrrHistory: { month: string; mrr: number }[];
  recurringRevenueAvailable: boolean;
  grossRevenue30d?: number;
  walletDeposits30d?: number;
  walletDebits30d?: number;
  grossSales30d?: number;
  fulfilledPurchaseCount30d?: number;
  activeVipUsers?: number;
  limitation?: string;
}

export interface ProductRevenueRow {
  product: string;
  revenue: number;
  fulfilledRevenue: number;
  fulfilledPurchaseCount: number;
  fulfilledPayingUsers: number;
  share: number;
  transactionCount: number;
  payingUsers: number;
}

export interface ProductRevenueData {
  currency: string;
  unit: string;
  periodDays: number;
  totalRevenue: number;
  totalFulfilledRevenue: number;
  fulfilledPurchaseCount: number;
  rows: ProductRevenueRow[];
}

export interface GenderRevenueGroup {
  revenue: number;
  payingUsers: number;
  paymentCount: number;
  arppu: number;
  fulfilledRevenue: number;
  fulfilledPurchaseCount: number;
  fulfilledPayingUsers: number;
  depositRevenue: number;
  depositingUsers: number;
  depositCount: number;
}

export interface GenderRevenueData {
  currency: string;
  unit: string;
  depositCurrency: string;
  depositUnit: string;
  periodDays: number;
  genderBasis: string;
  purchaseSource: string;
  fulfilledPurchaseSource: string;
  depositSource: string;
  male: GenderRevenueGroup;
  female: GenderRevenueGroup;
  unknown: GenderRevenueGroup;
  total: Omit<GenderRevenueGroup, "arppu"> & { arppu?: number };
}

export interface ArppuData {
  currency: string;
  unit: string;
  depositCurrency: string;
  depositUnit: string;
  periodDays: number;
  totalRevenue: number;
  paymentCount: number;
  payingUsers: number;
  arppu: number;
  fulfilledRevenue: number;
  fulfilledPurchaseCount: number;
  fulfilledPayingUsers: number;
  fulfilledArppu: number | null;
  activeUsers: number;
  payingRate: number;
  depositRevenue: number;
  depositCount: number;
  depositingUsers: number;
  definition: string;
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
  transactions?: number;
}

export interface ChurnRevenueData {
  periodDays: number;
  activeVipUsers: number;
  recentlyExpiredVipUsers: number;
  usersWithVipHistory: number;
  expiryRate: number;
  revenueMetricsAvailable: boolean;
  lostRevenue: number | null;
  recoveredRevenue: number | null;
  expansionRevenue: number | null;
  netRevenueRetention: number | null;
  history: {
    month: string;
    lost: number;
    recovered: number;
    expansion: number;
  }[];
  limitation?: string;
}

export interface ConcentrationData {
  currency: string;
  unit: string;
  periodDays: number;
  source: string;
  payingUsers: number;
  totalRevenue: number;
  top1pct: { users: number; revenue: number; share: number };
  top5pct: { users: number; revenue: number; share: number };
  top10pct: { users: number; revenue: number; share: number };
  giniCoefficient: number;
}

export interface ForecastAccuracyData {
  dataAvailable: boolean;
  currency?: string;
  mape: number | null;
  rmse: number | null;
  lastEvaluatedAt: string | null;
  history: { date: string; predicted: number; actual: number; error: number }[];
  evaluationMethod?: string;
  evaluationSamples?: number;
  reason?: string;
}

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
          revenue: p.revenue ?? p.predicted,
          confidence: Array.isArray(p.confidence)
            ? p.confidence
            : null,
        })),
        growthRate: data.growthRate ?? null,
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

export const useLtvBySource = () =>
  useQuery<LtvSourceRow[]>({
    queryKey: ["exec", "revenue", "ltv-by-source"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/ltv-by-source");
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

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
  useQuery<ProductRevenueData>({
    queryKey: ["exec", "revenue", "by-product"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/by-product");
      // Preserve compatibility with the previous array response while adapting
      // the current backend envelope containing rows and source totals.
      return Array.isArray(data)
        ? {
            currency: "IRT",
            unit: "rial",
            periodDays: 90,
            totalRevenue: data.reduce((sum, row) => sum + Number(row.revenue ?? 0), 0),
            totalFulfilledRevenue: data.reduce((sum, row) => sum + Number(row.fulfilledRevenue ?? 0), 0),
            fulfilledPurchaseCount: data.reduce((sum, row) => sum + Number(row.fulfilledPurchaseCount ?? 0), 0),
            rows: data,
          }
        : { ...data, rows: data.rows ?? [] };
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
      return Array.isArray(data) ? data : data.cohorts ?? [];
    },
    staleTime: 60 * 60 * 1000,
  });

export const useRevenueFunnel = () =>
  useQuery<FunnelStep[]>({
    queryKey: ["exec", "revenue", "funnel"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/revenue/funnel");
      return Array.isArray(data) ? data : data.steps ?? [];
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
