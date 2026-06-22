import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecisionRecord } from '../entities/decision-record.entity';
import { Recommendation } from '../interfaces/recommendation.interface';

@Injectable()
export class DecisionTrackerService {
  constructor(
    @InjectRepository(DecisionRecord)
    private decisionRepo: Repository<DecisionRecord>,
  ) {}

  // رفع باگ: دریافت کل Recommendation به جای فقط ID
  async accept(recommendation: Recommendation, notes?: string) {
    const record = this.decisionRepo.create({
      recommendationId: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      sourceDomain: recommendation.domain,
      expectedImpact: recommendation.expectedImpact,
      status: 'accepted',
      implementationNotes: notes,
      // ذخیره snapshot کامل برای تحلیل بعدی
      recommendationSnapshot: recommendation,
    });
    return this.decisionRepo.save(record);
  }

  async markImplemented(decisionId: number, notes?: string) {
    await this.decisionRepo.update(decisionId, {
      status: 'implemented',
      implementedAt: new Date(),
      implementationNotes: notes,
    });
    return this.decisionRepo.findOneBy({ id: decisionId });
  }

  async measure(decisionId: number, actualImpact: number) {
    await this.decisionRepo.update(decisionId, {
      actualImpact,
      status: 'measured',
    });
    return this.decisionRepo.findOneBy({ id: decisionId });
  }

  async getAll() {
    return this.decisionRepo.find({ order: { createdAt: 'DESC' } });
  }

  // نرخ دقت توصیه‌ها — برای Learning Loop
  async getAccuracyStats() {
    const measured = await this.decisionRepo.find({
      where: { status: 'measured' },
    });

    if (!measured.length) return { accuracy: 0, avgRoi: 0, count: 0 };

    let successCount = 0;
    let totalRoi = 0;

    for (const record of measured) {
      if (record.actualImpact > 0 && record.expectedImpact > 0) {
        const ratio = record.actualImpact / record.expectedImpact;
        if (ratio >= 0.5) successCount++;
        totalRoi += ratio;
      }
    }

    return {
      accuracy: Math.round((successCount / measured.length) * 100),
      avgRoi: Math.round((totalRoi / measured.length) * 100) / 100,
      count: measured.length,
    };
  }
}