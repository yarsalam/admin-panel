// مسیر: apps/server/src/executive/intelligence/analyzers/revenue.analyzer.ts
import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { RevenueMetrics, KPIValue } from 'src/interfaces';

@Injectable()
export class RevenueAnalyzer {
  analyze(raw: RawSnapshot): RevenueMetrics {
    const thisMonth = parseFloat(raw.revenueThisMonth || '0');
    const lastMonth = parseFloat(raw.revenueLastMonth || '0');
    const delta =
      lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : 0;

    const conversionRate =
      raw.totalActiveUsers > 0
        ? Math.round((raw.premiumUserCount / raw.totalActiveUsers) * 100 * 10) /
          10
        : 0;
    const arpu =
      raw.premiumUserCount > 0
        ? Math.round(thisMonth / raw.premiumUserCount)
        : 0;

    return {
      mrr: {
        current: Math.round(thisMonth),
        previous: Math.round(lastMonth),
        deltaPercent: delta,
        direction: delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable',
      } as KPIValue,
      arpu,
      conversionRate,
      churnRate: 0, // نیاز به جدول subscription دارد — placeholder
      ltv: arpu * 6, // برآورد ساده: میانگین ۶ ماه
      totalThisMonth: Math.round(thisMonth),
    };
  }
}
