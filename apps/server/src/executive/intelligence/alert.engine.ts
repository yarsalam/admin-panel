import { Injectable } from '@nestjs/common';
import {
  Alert,
  FemaleMetrics,
  GrowthMetrics,
  MatchHealth,
  SafetyMetrics,
  DatingFunnel,
  RevenueMetrics,
} from 'src/interfaces';

interface AlertInput {
  femaleMetrics: FemaleMetrics;
  growth: GrowthMetrics;
  matchHealth: MatchHealth;
  safety: SafetyMetrics;
  funnel: DatingFunnel;
  revenue: RevenueMetrics;
}

@Injectable()
export class AlertEngine {
  generate(input: AlertInput): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();
    const push = (a: Omit<Alert, 'id' | 'triggeredAt'>) =>
      alerts.push({
        ...a,
        id: `alert_${alerts.length + 1}_${Date.now()}`,
        triggeredAt: now,
      });

    if (
      input.femaleMetrics.healthScore === 'critical' ||
      input.femaleMetrics.femaleRatio < 15
    ) {
      push({
        severity: 'critical',
        domain: 'gender',
        title: 'نسبت کاربران زن بحرانی است',
        detail: `نسبت زنان ${input.femaleMetrics.femaleRatio}٪ — زیر آستانه سلامت بازار.`,
      });
    }

    if (input.matchHealth.matchRate.current < 5) {
      push({
        severity: 'high',
        domain: 'matching',
        title: 'نرخ Match پایین است',
        detail: `نرخ Match ${input.matchHealth.matchRate.current}٪ — کیفیت پیشنهادها را بررسی کنید.`,
      });
    }

    if (input.funnel.criticalBottleneck) {
      const bn = input.funnel.steps.find((s) => s.isBottleneck);
      push({
        severity: 'high',
        domain: 'growth',
        title: 'گلوگاه بحرانی در قیف',
        detail: bn
          ? `افت شدید در مرحله «${bn.label}» (${bn.dropRate}٪).`
          : 'گلوگاه بحرانی شناسایی شد.',
      });
    }

    if (input.safety.pendingModeration > 50) {
      push({
        severity: 'medium',
        domain: 'safety',
        title: 'صف بررسی محتوا شلوغ است',
        detail: `${input.safety.pendingModeration} مورد در انتظار بررسی.`,
      });
    }

    if (input.revenue.mrr.direction === 'down') {
      push({
        severity: 'high',
        domain: 'revenue',
        title: 'کاهش درآمد ماهانه',
        detail: `MRR نسبت به ماه قبل ${input.revenue.mrr.deltaPercent}٪ تغییر کرده.`,
      });
    }

    return alerts;
  }
}
