import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { GrowthMetrics, KPIValue, Trend } from 'src/interfaces';

function kpi(current: number, previous: number, target?: number): KPIValue {
  const delta =
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  const direction: Trend = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable';
  return { current, previous, deltaPercent: delta, direction, target };
}

@Injectable()
export class GrowthAnalyzer {
  analyze(raw: RawSnapshot): GrowthMetrics {
    const retD7 =
      raw.cohort7dBase > 0
        ? Math.round((raw.cohort7dReturned / raw.cohort7dBase) * 100)
        : 0;
    const retD30 =
      raw.cohort30dBase > 0
        ? Math.round((raw.cohort30dReturned / raw.cohort30dBase) * 100)
        : 0;

    // MAU delta: فرض می‌کنیم mauPrevCount = کاربران ۳۱-۶۰ روز پیش
    const mauPrev = raw.mauPrevCount;

    return {
      dau: kpi(raw.dauCount, raw.dauYesterdayCount, undefined),
      mau: kpi(raw.mauCount, mauPrev || raw.mauCount, undefined),
      dauMauRatio:
        raw.mauCount > 0 ? Math.round((raw.dauCount / raw.mauCount) * 100) : 0,
      newUsersToday: raw.newToday,
      newUsersThisWeek: raw.newThisWeek,
      retentionD7: kpi(retD7, retD7, 45), // target: 45%
      retentionD30: kpi(retD30, retD30, 25), // target: 25%
    };
  }
}
