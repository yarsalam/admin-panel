import { Injectable } from '@nestjs/common';
import {
  Recommendation,
  FemaleMetrics,
  GrowthMetrics,
  MatchHealth,
  SafetyMetrics,
  DatingFunnel,
  RevenueMetrics,
} from 'src/interfaces';

interface RecInput {
  femaleMetrics: FemaleMetrics;
  growth: GrowthMetrics;
  matchHealth: MatchHealth;
  safety: SafetyMetrics;
  funnel: DatingFunnel;
  revenue: RevenueMetrics;
}

@Injectable()
export class RecommendationEngine {
  generate(input: RecInput): Recommendation[] {
    const recs: Recommendation[] = [];
    const now = new Date();
    const push = (r: Omit<Recommendation, 'id' | 'createdAt'>) =>
      recs.push({
        ...r,
        id: `rec_${recs.length + 1}_${Date.now()}`,
        createdAt: now,
      });

    if (input.femaleMetrics.femaleRatio < 20) {
      push({
        domain: 'users',
        priority: 'critical',
        title: 'افزایش جذب کاربران زن',
        description: 'کمپین جذب هدفمند و مزایای ویژه برای کاربران زن.',
        rootCause: `نسبت زنان تنها ${input.femaleMetrics.femaleRatio}٪ است.`,
        expectedImpact: 30,
        impactLabel: 'بالا',
        confidence: 75,
        action: 'راه‌اندازی کمپین رفرال زنان + verification رایگan',
      });
    }

    const bottleneck = input.funnel.steps.find((s) => s.isBottleneck);
    if (bottleneck) {
      push({
        domain: 'matching',
        priority: 'high',
        title: `رفع گلوگاه: ${bottleneck.label}`,
        description: bottleneck.suggestion || 'بهبود این مرحله از قیف.',
        rootCause: bottleneck.rootCause || `افت ${bottleneck.dropRate}٪.`,
        expectedImpact: 20,
        impactLabel: 'متوسط',
        confidence: 70,
        action: bottleneck.suggestion || 'بهینه‌سازی مرحله',
      });
    }

    if (input.matchHealth.ghostingRate > 40) {
      push({
        domain: 'matching',
        priority: 'high',
        title: 'کاهش نرخ Ghosting',
        description: 'اضافه کردن Ice Breaker و پیشنهاد پیام اولیه هوشمند.',
        rootCause: `نرخ Ghosting ${input.matchHealth.ghostingRate}٪.`,
        expectedImpact: 15,
        impactLabel: 'متوسط',
        confidence: 65,
        action: 'فعال‌سازی Ice Breaker پس از Match',
      });
    }

    return recs;
  }

  async generateSEORecommendation(score: {
    overall: number;
    breakdown: Record<string, number>;
  }) {
    const entries = Object.entries(score.breakdown) as [string, number][];
    const weakest = entries.sort((a, b) => a[1] - b[1])[0];

    const actionMap: Record<string, { action: string; reason: string }> = {
      technical: {
        action: 'رفع خطاهای فنی سئو (سرعت لود، meta tags)',
        reason: 'امتیاز فنی پایین روی رتبه‌بندی اثر می‌گذارد',
      },
      aeo: {
        action: 'بهینه‌سازی محتوا برای پاسخ‌های AI',
        reason: 'برند در موتورهای AI کمتر دیده می‌شود',
      },
      backlink: {
        action: 'شروع کمپین لینک‌سازی',
        reason: 'کیفیت بک‌لینک پایین است',
      },
      competitor: {
        action: 'بررسی استراتژی کلمات کلیدی رقبا',
        reason: 'بیشترین شکاف با رقبا اینجاست',
      },
      recommender: {
        action: 'جمع‌آوری تعاملات بیشتر کاربر',
        reason: 'مدل داده کافی برای پیشنهاد ندارد',
      },
      user: {
        action: 'بهبود نرخ تعامل کاربر با محتوای سئو',
        reason: 'سیگنال‌های کاربری ضعیف است',
      },
      campaign: {
        action: 'بازبینی کمپین‌های کم‌بازده',
        reason: 'بازده محتوایی پایین است',
      },
    };

    const detail = actionMap[weakest[0]] ?? {
      action: 'بررسی داده‌ی سئو',
      reason: 'داده کافی نیست',
    };

    return {
      priority: (weakest[1] < 40
        ? 'high'
        : weakest[1] < 70
          ? 'medium'
          : 'low') as 'high' | 'medium' | 'low',
      action: detail.action,
      reason: detail.reason,
    };
  }
}
