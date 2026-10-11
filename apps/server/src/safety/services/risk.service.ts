import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

export interface RiskResult {
  userId: number;
  riskScore: number; // 0–100
  trustScore: number; // 0–100
  level: 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
  recommendedAction: 'none' | 'monitor' | 'manual_review' | 'restrict' | 'ban';
}

@Injectable()
export class RiskService {
  constructor(private userApi: UserApiClientService) {}

  async calculateRisk(userId: number): Promise<RiskResult> {
    const [profile, financial, reports, activity, modLogs] = await Promise.all([
      this.userApi
        .get(`/admin-api/safety/users/${userId}/profile`)
        .catch(() => null),
      this.userApi
        .get(`/admin-api/safety/users/${userId}/financial`)
        .catch(() => null),
      this.userApi
        .get(`/admin-api/safety/users/${userId}/reports`)
        .catch(() => []),
      this.userApi
        .get(`/admin-api/safety/users/${userId}/activity`)
        .catch(() => null),
      this.userApi
        .get(`/admin-api/safety/users/${userId}/moderation-logs`)
        .catch(() => []),
    ]);

    let riskScore = 0;
    const signals: string[] = [];

    // ── Report signals ──────────────────────────────────────────────────────
    const reportCount = Array.isArray(reports) ? reports.length : 0;
    if (reportCount >= 10) {
      riskScore += 30;
      signals.push('بیش از ۱۰ گزارش دریافت‌شده');
    } else if (reportCount >= 5) {
      riskScore += 15;
      signals.push('گزارش‌های متعدد');
    } else if (reportCount >= 2) {
      riskScore += 5;
      signals.push('گزارش‌های محدود');
    }

    // ── Moderation signals ──────────────────────────────────────────────────
    const flaggedCount = Array.isArray(modLogs) ? modLogs.length : 0;
    if (flaggedCount >= 5) {
      riskScore += 20;
      signals.push('محتوای پرچم‌دار مکرر');
    } else if (flaggedCount >= 2) {
      riskScore += 8;
      signals.push('محتوای پرچم‌دار');
    }

    // ── Financial signals ────────────────────────────────────────────────────
    const payments = financial?.payments ?? [];
    const failedPayments = payments.filter(
      (p: any) => p.status === 'failed',
    ).length;
    if (failedPayments >= 3) {
      riskScore += 10;
      signals.push('پرداخت‌های ناموفق مکرر');
    }

    // ── Account age ──────────────────────────────────────────────────────────
    if (profile?.createdAt) {
      const ageMs = Date.now() - new Date(profile.createdAt).getTime();
      const ageDays = ageMs / 86400000;
      if (ageDays < 3) {
        riskScore += 15;
        signals.push('حساب بسیار جدید');
      } else if (ageDays < 14) {
        riskScore += 5;
        signals.push('حساب جدید');
      }
    }

    // ── Activity anomalies ───────────────────────────────────────────────────
    const msgCount = activity?.messages?.length ?? 0;
    if (msgCount > 500) {
      riskScore += 10;
      signals.push('پیام‌رسانی بسیار سریع');
    }

    riskScore = Math.min(100, riskScore);
    const trustScore = Math.max(0, 100 - riskScore);

    const level: RiskResult['level'] =
      riskScore >= 70
        ? 'critical'
        : riskScore >= 45
          ? 'high'
          : riskScore >= 20
            ? 'medium'
            : 'low';

    const recommendedAction: RiskResult['recommendedAction'] =
      riskScore >= 70
        ? 'ban'
        : riskScore >= 50
          ? 'restrict'
          : riskScore >= 30
            ? 'manual_review'
            : riskScore >= 15
              ? 'monitor'
              : 'none';

    return { userId, riskScore, trustScore, level, signals, recommendedAction };
  }
}
