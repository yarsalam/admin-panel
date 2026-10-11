import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { MonetizationMetrics, KPIValue } from 'src/interfaces';

@Injectable()
export class MonetizationAnalyzer {
  analyze(raw: RawSnapshot): MonetizationMetrics {
    const thisMonth = parseFloat(raw.revenueThisMonth || '0');
    const lastMonth = parseFloat(raw.revenueLastMonth || '0');
    const delta =
      lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : 0;

    const mrr: KPIValue = {
      current: Math.round(thisMonth),
      previous: Math.round(lastMonth),
      deltaPercent: delta,
      direction: delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable',
    };

    const paying = raw.payingUserCount || raw.premiumUserCount || 0;
    const arpu =
      raw.totalActiveUsers > 0
        ? Math.round(thisMonth / raw.totalActiveUsers)
        : 0;
    const arppu = paying > 0 ? Math.round(thisMonth / paying) : 0;
    const conversionRate =
      raw.totalActiveUsers > 0
        ? Math.round((paying / raw.totalActiveUsers) * 100 * 10) / 10
        : 0;
    const ltv = arppu * 6;

    return {
      mrr,
      arr: Math.round(thisMonth * 12),
      arpu,
      arppu,
      ltv,
      cac: 0,
      paybackPeriodMonths: 0,
      conversionRate,
      renewalRate: 0,
      churnRate: 0,
      refundRate: 0,
      revenuePerFemale: 0,
      revenuePerMale: 0,
      totalThisMonth: Math.round(thisMonth),
    };
  }
}
