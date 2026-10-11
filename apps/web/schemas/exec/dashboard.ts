import { z } from "zod";

export const dashboardKPISchema = z.object({
  totalUsers: z.number(),
  totalRevenue: z.number(),
  growthRate: z.number(),
  feedbackScore: z.number(),
});

export const phaseDistributionSchema = z.array(
  z.object({
    name: z.string(),
    value: z.number(),
  })
);

export const alertsSchema = z.array(
  z.object({
    type: z.enum(["critical", "warning"]),
    message: z.string(),
    timestamp: z.string().datetime(),
  })
);

export const competitorRadarSchema = z.array(
  z.object({
    name: z.string(),
    change: z.number(),
  })
);