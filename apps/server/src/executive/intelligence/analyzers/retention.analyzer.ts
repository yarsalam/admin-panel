import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { RetentionMetrics, RetentionCohort } from 'src/interfaces';

@Injectable()
export class RetentionAnalyzer {
  analyze(raw: RawSnapshot): RetentionMetrics {
    const rate = (ret: number, base: number) =>
      base > 0 ? Math.round((ret / base) * 100) : 0;

    const d7: RetentionCohort = {
      label: 'D7',
      days: 7,
      rate: rate(raw.cohort7dReturned, raw.cohort7dBase),
      cohortSize: raw.cohort7dBase,
      returned: raw.cohort7dReturned,
    };
    const d30: RetentionCohort = {
      label: 'D30',
      days: 30,
      rate: rate(raw.cohort30dReturned, raw.cohort30dBase),
      cohortSize: raw.cohort30dBase,
      returned: raw.cohort30dReturned,
    };

    const femaleD30 = rate(
      raw.femaleRetention30dReturned,
      raw.femaleRetention30dBase,
    );

    // 🆕 maleD30 واقعی
    const maleD30 = rate(
      raw.maleRetention30dReturned,
      raw.maleRetention30dBase,
    );

    return {
      cohorts: [d7, d30],
      femaleVsMale: { femaleD30, maleD30 }, // 🆕 دیگه صفر نیست
      premiumVsFree: {
        premiumD30: rate(
          raw.premiumRetention30dReturned,
          raw.premiumRetention30dBase,
        ),
        freeD30: rate(raw.freeRetention30dReturned, raw.freeRetention30dBase),
      },
    };
  }
}
