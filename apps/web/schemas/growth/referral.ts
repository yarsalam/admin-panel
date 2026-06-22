import { z } from 'zod';

export const campaignSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  description: z.string().optional(),
  rewardType: z.enum(['vip_days', 'credit', 'boost']),
  rewardValue: z.number().min(1),
  bothRewarded: z.boolean(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export const campaignFormSchema = campaignSchema.omit({ id: true });

export const referralStatsSchema = z.object({
  totalReferrals: z.number(),
  conversionRate: z.number(),
  activeCampaigns: z.number(),
});

export const topReferrerSchema = z.object({
  userId: z.number(),
  username: z.string(),
  referralCount: z.number(),
});