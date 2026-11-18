import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../client';

export interface ManualPromotionCampaign {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bundleCode: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  audienceType: 'all' | 'users' | 'phases';
  audienceUserIds: number[] | null;
  audiencePhases: string[] | null;
  startsAt: string;
  endsAt: string;
  maxRedemptions: number | null;
  perUserLimit: number;
  priority: number;
  active: boolean;
  reservedCount?: number;
  redeemedCount?: number;
}

export interface ManualPromotionReport {
  campaignId: string;
  reserved: number;
  redeemed: number;
  released: number;
  discountRials: number;
  maxRedemptions: number | null;
  active: boolean;
}

const root = '/growth/manual-promotions';

export const useManualPromotionCampaigns = () =>
  useQuery<ManualPromotionCampaign[]>({
    queryKey: ['growth', 'manual-promotions'],
    queryFn: async () => {
      const { data } = await apiClient.get(root);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15_000,
  });

export const useManualPromotionReport = (id: string | null) =>
  useQuery<ManualPromotionReport>({
    queryKey: ['growth', 'manual-promotions', id, 'report'],
    queryFn: async () => {
      const { data } = await apiClient.get(root + '/' + encodeURIComponent(id!) + '/report');
      return data;
    },
    enabled: Boolean(id),
  });

export const useCreateManualPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, any>) => {
      const { data } = await apiClient.post(root, body);
      return data as ManualPromotionCampaign;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growth', 'manual-promotions'] }),
  });
};

export const useUpdateManualPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, any> }) => {
      const { data } = await apiClient.patch(root + '/' + encodeURIComponent(id), body);
      return data as ManualPromotionCampaign;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growth', 'manual-promotions'] }),
  });
};

export const useDisableManualPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(root + '/' + encodeURIComponent(id));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growth', 'manual-promotions'] }),
  });
};
