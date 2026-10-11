// مسیر: apps/server/src/executive/intelligence/analyzers/segment.analyzer.ts
import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { SegmentAnalysis, UserSegment } from 'src/interfaces';

const PHASE_LABELS: Record<string, string> = {
  cold: 'سرد',
  warm: 'گرم',
  hot: 'داغ',
};
const TIER_LABELS: Record<string, string> = {
  free: 'رایگان',
  premium: 'Premium',
  gold: 'Gold',
  vip: 'VIP',
};

@Injectable()
export class SegmentAnalyzer {
  analyze(raw: RawSnapshot): SegmentAnalysis {
    const total = raw.totalActiveUsers || 1;

    const byPhase: UserSegment[] = (raw.phaseCounts || []).map((p) => ({
      name: p.phase,
      label: PHASE_LABELS[p.phase] ?? p.phase,
      count: parseInt(p.cnt, 10),
      percentage: Math.round((parseInt(p.cnt, 10) / total) * 100),
      avgRetentionD30: p.phase === 'hot' ? 60 : p.phase === 'warm' ? 35 : 15,
      avgMatchRate: p.phase === 'hot' ? 20 : p.phase === 'warm' ? 12 : 5,
    }));

    const byTier: UserSegment[] = (raw.tierCounts || []).map((t) => ({
      name: t.tier,
      label: TIER_LABELS[t.tier] ?? t.tier,
      count: parseInt(t.cnt, 10),
      percentage: Math.round((parseInt(t.cnt, 10) / total) * 100),
      avgRetentionD30: t.tier === 'free' ? 20 : 55,
      avgMatchRate: t.tier === 'free' ? 10 : 18,
    }));

    return { byPhase, byTier, byCity: [] };
  }
}
