import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessScoreSnapshot } from './entities/business-score-snapshot.entity';
import { RawDataCollector } from '../intelligence/collectors/raw-data.collector';
import { BusinessScoreCalculator } from '../intelligence/business-score.calculator';
import { FemaleMetricsAnalyzer } from '../intelligence/analyzers/female-metrics.analyzer';
import { MatchHealthAnalyzer } from '../intelligence/analyzers/match-health.analyzer';
import { GrowthAnalyzer } from '../intelligence/analyzers/growth.analyzer';
import { RevenueAnalyzer } from '../intelligence/analyzers/revenue.analyzer';
import { SafetyAnalyzer } from '../intelligence/analyzers/safety.analyzer';

// KPIهایی که افزایششون بده (Ghosting, Churn, Reports)
const INVERTED_DELTA_FIELDS = ['ghostingRatePct', 'churnRate'];

@Injectable()
export class BusinessScoreService {
  constructor(
    @InjectRepository(BusinessScoreSnapshot)
    private readonly repo: Repository<BusinessScoreSnapshot>,
    private readonly collector: RawDataCollector,
    private readonly scoreCalc: BusinessScoreCalculator,
    private readonly femaleAnalyzer: FemaleMetricsAnalyzer,
    private readonly matchAnalyzer: MatchHealthAnalyzer,
    private readonly growthAnalyzer: GrowthAnalyzer,
    private readonly revenueAnalyzer: RevenueAnalyzer,
    private readonly safetyAnalyzer: SafetyAnalyzer,
  ) {}

  // ═══════════════ محاسبه همه KPIها از Raw Data ═══════════════
  async computeAllKPIs() {
    const raw = await this.collector.collect();
    const female = this.femaleAnalyzer.analyze(raw);
    const match = this.matchAnalyzer.analyze(raw);
    const growth = this.growthAnalyzer.analyze(raw);
    const revenue = this.revenueAnalyzer.analyze(raw);
    const safety = this.safetyAnalyzer.analyze(raw);
    const score = this.scoreCalc.calculate({
      femaleMetrics: female,
      matchHealth: match,
      growth,
      revenue,
      safety,
    });

    return {
      // ── Business Score sub-scores ──
      total: score.total,
      revenue: score.breakdown?.revenue ?? 0,
      retention: score.breakdown?.retention ?? 0,
      matching: score.breakdown?.matching ?? 0,
      femaleHealth: score.breakdown?.femaleHealth ?? 0,
      safety: score.breakdown?.safety ?? 0,

      // ── Hero KPIs ──
      femaleRatioPct: female.femaleRatio ?? 0,
      mrr: revenue.mrr?.current ?? 0,
      premiumConversionPct: revenue.conversionRate ?? 0,
      retentionD30Pct: growth.retentionD30?.current ?? 0,
      ghostingRatePct: match.ghostingRate ?? 0,

      // ── Growth ──
      dau: growth.dau?.current ?? 0,
      mau: growth.mau?.current ?? 0,
      dauMauRatio: growth.dauMauRatio ?? 0,
      newUsersToday: growth.newUsersToday ?? 0,

      // ── Revenue ──
      arpu: revenue.arpu ?? 0,
      churnRate: revenue.churnRate ?? 0,
      totalThisMonth: revenue.totalThisMonth ?? 0,

      // ── Match Health ──
      matchRate: match.matchRate?.current ?? 0,
      conversationRate: match.conversationRate?.current ?? 0,
      replyRate: match.replyRate?.current ?? 0,
    };
  }

  // ═══════════════ ذخیره Snapshot امروز (فقط با Cron یا POST) ═══════════════
  async saveTodaysSnapshot(): Promise<void> {
    const kpis = await this.computeAllKPIs();
    const today = new Date().toISOString().split('T')[0];

    await this.repo.upsert(
      {
        snapshotDate: today,
        total: kpis.total,
        revenue: kpis.revenue,
        retention: kpis.retention,
        matching: kpis.matching,
        femaleHealth: kpis.femaleHealth,
        safety: kpis.safety,
        femaleRatioPct: kpis.femaleRatioPct,
        mrr: kpis.mrr,
        premiumConversionPct: kpis.premiumConversionPct,
        retentionD30Pct: kpis.retentionD30Pct,
        ghostingRatePct: kpis.ghostingRatePct,
        dau: kpis.dau,
        mau: kpis.mau,
        dauMauRatio: kpis.dauMauRatio,
        newUsersToday: kpis.newUsersToday,
        arpu: kpis.arpu,
        churnRate: kpis.churnRate,
        totalThisMonth: kpis.totalThisMonth,
        matchRate: kpis.matchRate,
        conversationRate: kpis.conversationRate,
        replyRate: kpis.replyRate,
      },
      ['snapshotDate'],
    );
  }

  // ═══════════════ پیدا کردن نزدیک‌ترین Snapshot به ۷ روز پیش ═══════════════
  private async findClosestSnapshot(): Promise<BusinessScoreSnapshot | null> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split('T')[0];

    // ✅ اگر ۸-۶ روز پیش چیزی نبود، نزدیک‌ترین قبلش رو می‌گیره
    return this.repo
      .createQueryBuilder('s')
      .where('s.snapshotDate <= :target', { target: sevenDaysAgo })
      .orderBy('s.snapshotDate', 'DESC')
      .getOne();
  }

  // ═══════════════ محاسبه Delta با جهت صحیح ═══════════════
  private computeDelta(
    curr: number,
    prev: number,
    field: string,
  ): number | null {
    if (prev === 0 || prev === null || prev === undefined) return null;

    const rawDelta = ((curr - prev) / prev) * 100;
    const rounded = Math.round(rawDelta * 10) / 10;

    // KPIهای معکوس: افزایششون بده (Ghosting, Churn)
    if (INVERTED_DELTA_FIELDS.includes(field)) {
      return -rounded; // علامت رو برعکس کن
    }

    return rounded;
  }

  // ═══════════════ GET: همه Deltaها (فقط خواندنی) ═══════════════
  async getAllDeltas(): Promise<
    Record<
      string,
      { current: number; previous: number | null; delta: number | null }
    >
  > {
    const current = await this.computeAllKPIs();
    const prev = await this.findClosestSnapshot();

    const result: Record<
      string,
      { current: number; previous: number | null; delta: number | null }
    > = {};

    for (const [field, currValue] of Object.entries(current)) {
      const prevValue = prev ? (prev as any)[field] : null;
      const delta =
        prevValue !== null
          ? this.computeDelta(currValue, Number(prevValue), field)
          : null;

      result[field] = {
        current: currValue,
        previous: prevValue !== null ? Number(prevValue) : null,
        delta,
      };
    }

    return result;
  }
}
