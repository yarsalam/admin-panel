import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { MatchHealth, KPIValue } from 'src/interfaces';

function kpi(current: number, prev = current): KPIValue {
  const delta = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;
  return {
    current,
    previous: prev,
    deltaPercent: delta,
    direction: delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable',
  };
}

@Injectable()
export class MatchHealthAnalyzer {
  analyze(raw: RawSnapshot): MatchHealth {
    const matchRate =
      raw.likesLast30d > 0
        ? Math.round((raw.matchesLast30d / raw.likesLast30d) * 100 * 10) / 10
        : 0;

    const convRate =
      raw.matchesLast30d > 0
        ? Math.round((raw.conversationPairCount / raw.matchesLast30d) * 100)
        : 0;

    const totalMsgs = parseInt(raw.replyStats?.total || '0', 10);
    const readMsgs = parseInt(raw.replyStats?.readCount || '0', 10);
    const replyRate =
      totalMsgs > 0 ? Math.round((readMsgs / totalMsgs) * 100) : 0;

    const pairs = raw.avgMsgPerPair || [];
    const firstMsgSuccess =
      pairs.length > 0
        ? Math.round(
            (pairs.filter((p) => parseInt(p.msgCount, 10) >= 3).length /
              pairs.length) *
              100,
          )
        : 0;
    const avgMsgs =
      pairs.length > 0
        ? Math.round(
            pairs.reduce((s, p) => s + parseInt(p.msgCount, 10), 0) /
              pairs.length,
          )
        : 0;

    // 🆕 Ghosting Rate: گفتگوهایی که فقط ۱ پیام دارن
    const ghostingRate =
      raw.conversationPairCount > 0
        ? Math.round(
            ((raw.ghostedPairCount || 0) / raw.conversationPairCount) * 100,
          )
        : 0;

    // 🆕 Read Rate: پیام‌های خوانده‌شده
    const readRate =
      totalMsgs > 0 ? Math.round((readMsgs / totalMsgs) * 100) : 0;

    const qualityScore = Math.round(
      matchRate * 2.5 +
        convRate * 0.35 +
        replyRate * 0.15 +
        firstMsgSuccess * 0.5,
    );

    return {
      matchRate: kpi(matchRate),
      conversationRate: kpi(convRate),
      replyRate: kpi(replyRate),
      readRate: kpi(readRate), // 🆕
      firstMessageSuccessRate: firstMsgSuccess,
      avgMessagesPerMatch: avgMsgs,
      ghostingRate,
      qualityScore: Math.min(100, qualityScore),
      // mutualMatchRate حذف شد
    };
  }
}
