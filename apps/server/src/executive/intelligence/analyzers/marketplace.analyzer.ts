import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { MarketplaceMetrics } from 'src/interfaces';

@Injectable()
export class MarketplaceAnalyzer {
  analyze(raw: RawSnapshot): MarketplaceMetrics {
    const byGender = (arr: { gender: string; cnt: string }[], g: string) =>
      parseInt(arr.find((r) => r.gender === g)?.cnt || '0', 10);

    // ✅ هر دو عدد از activeGenderCounts — بازه ۳۰ روزه یکسان
    // قبلاً activeMale = DAU - female30d بود که اشتباه محض بود
    const females = byGender(raw.activeGenderCounts, 'female');
    const males = byGender(raw.activeGenderCounts, 'male');

    const safeF = females || 1;
    const safeM = males || 1;

    const maleFemaleRatio = Math.round((safeM / safeF) * 10) / 10;

    const unansweredLikesRatio =
      raw.unansweredLikesCount > 0 && raw.likesLast30d > 0
        ? Math.round((raw.unansweredLikesCount / raw.likesLast30d) * 100)
        : 0;

    const balance = Math.max(0, 100 - Math.abs(maleFemaleRatio - 1) * 30);
    const supplyDemandBalance = Math.round(balance);
    const marketHealthScore = Math.round(
      supplyDemandBalance * 0.5 + (100 - unansweredLikesRatio) * 0.5,
    );

    return {
      // ✅ نام‌گذاری صادقانه: پسوند 30d نشون می‌ده این عددها ۳۰ روزه‌اند نه ۷ روزه
      activeFemale30d: females,
      activeMale30d: males,
      maleFemaleRatio,
      femaleDemandScore: Math.min(100, unansweredLikesRatio),
      maleDemandScore: Math.min(100, 100 - unansweredLikesRatio),
      unansweredLikesRatio,
      supplyDemandBalance,
      marketHealthScore,
    };
  }
}
