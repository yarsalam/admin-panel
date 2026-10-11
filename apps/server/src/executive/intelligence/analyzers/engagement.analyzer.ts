import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { EngagementMetrics } from 'src/interfaces';

@Injectable()
export class EngagementAnalyzer {
  analyze(raw: RawSnapshot): EngagementMetrics {
    const active = raw.totalActiveUsers || 1;
    const totalMsgs = parseInt(raw.replyStats?.total || '0', 10);

    const avgMessagesPerUser = Math.round((totalMsgs / active) * 10) / 10;
    const avgLikesPerUser = Math.round((raw.likesLast30d / active) * 10) / 10;
    const avgSessionsPerUser = raw.totalSessions7d
      ? Math.round((raw.totalSessions7d / active) * 10) / 10
      : 0;

    const engagementScore = Math.min(
      100,
      Math.round(avgMessagesPerUser * 5 + avgLikesPerUser * 3),
    );

    return {
      avgSessionsPerUser,
      avgLikesPerUser,
      avgMessagesPerUser,
      dau7dAvg: raw.dauCount,
      peakHour: parseInt(raw.peakHour || '21', 10),
      engagementScore,
      // avgMessagesPerDAU حذف شد
    };
  }
}
