// مسیر: apps/server/src/executive/intelligence/analyzers/safety.analyzer.ts
import { Injectable } from '@nestjs/common';
import { RawSnapshot } from '../collectors/raw-data.collector';
import { SafetyMetrics } from 'src/interfaces';

@Injectable()
export class SafetyAnalyzer {
  analyze(raw: RawSnapshot): SafetyMetrics {
    return {
      reportsToday: raw.reportsToday,
      pendingModeration: raw.pendingModeration,
      autoBlocked: raw.blockedToday,
      fakeProfiles: raw.fakeProfileCount,
      highRiskUsers: raw.highRiskCount,
      verifiedProfiles: raw.verifiedAllCount,
    };
  }
}
