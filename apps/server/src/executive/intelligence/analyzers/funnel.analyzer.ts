// مسیر: apps/server/src/executive/intelligence/analyzers/funnel.analyzer.ts
import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { DatingFunnel, FunnelStep } from 'src/interfaces';

@Injectable()
export class FunnelAnalyzer {
  analyze(raw: RawSnapshot): DatingFunnel {
    const n = (v: string | number) => parseInt(String(v), 10);

    const rawSteps = [
      { step: 'signup',           label: 'ثبت‌نام',          count: raw.signups30d },
      { step: 'profile_complete', label: 'تکمیل پروفایل',    count: raw.completedProfiles30d },
      { step: 'photo_upload',     label: 'آپلود عکس',        count: n(raw.withPhotos30d) },
      { step: 'first_like',       label: 'اولین لایک',       count: n(raw.firstLikers30d) },
      { step: 'first_match',      label: 'اولین Match',       count: n(raw.firstMatchReceivers30d) },
      { step: 'first_chat',       label: 'اولین چت',          count: n(raw.firstChatters30d) },
    ];

    const SUGGESTIONS: Record<string, string> = {
      profile_complete: 'اضافه کردن راهنمای تعاملی و نمایش preview پروفایل',
      photo_upload: 'ساده‌سازی آپلود عکس — کمک به انتخاب بهترین عکس',
      first_like: 'نمایش پروفایل‌های جذاب‌تر در ابتدا (Onboarding Feed)',
      first_match: 'بهبود Ranking Engine — اولین Match در ۲۴ ساعت هدف باشد',
      first_chat: 'اضافه کردن Ice Breaker پس از Match',
    };

    const steps: FunnelStep[] = rawSteps.map((s, i) => {
      const prev = i > 0 ? rawSteps[i - 1].count : s.count;
      const conv = prev > 0 ? Math.round((s.count / prev) * 100) : null;
      const drop = conv !== null ? 100 - conv : 0;
      return {
        step: s.step,
        label: s.label,
        count: s.count,
        conversionFromPrevious: i === 0 ? null : conv,
        dropRate: i === 0 ? 0 : drop,
        isBottleneck: drop > 40 && i > 0,
        suggestion: SUGGESTIONS[s.step],
        rootCause: drop > 40 ? `${drop}٪ ریزش — بالاترین نقطه افت` : undefined,
      };
    });

    const overallConversion = raw.signups30d > 0
      ? Math.round((n(raw.firstChatters30d) / raw.signups30d) * 100) : 0;

    return {
      steps,
      overallConversion,
      criticalBottleneck: steps.some((s) => s.dropRate > 50),
      period: 'last_30_days',
    };
  }
}
