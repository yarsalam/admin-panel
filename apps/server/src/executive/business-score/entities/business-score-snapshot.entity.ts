import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('business_score_snapshot')
@Index(['snapshotDate'], { unique: true })
export class BusinessScoreSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  snapshotDate: string;

  // ── Business Score sub-scores (۰-۱۰۰) ──
  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'int' })
  revenue: number;

  @Column({ type: 'int' })
  retention: number;

  @Column({ type: 'int' })
  matching: number;

  @Column({ type: 'int' })
  femaleHealth: number;

  @Column({ type: 'int' })
  safety: number;

  // ── Hero KPI raw values ──
  @Column({ type: 'decimal', precision: 6, scale: 2 })
  femaleRatioPct: number;

  @Column({ type: 'bigint' })
  mrr: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  premiumConversionPct: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  retentionD30Pct: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  ghostingRatePct: number;

  // ── Growth KPIs ──
  @Column({ type: 'int', default: 0 })
  dau: number;

  @Column({ type: 'int', default: 0 })
  mau: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  dauMauRatio: number;

  @Column({ type: 'int', default: 0 })
  newUsersToday: number;

  // ── Revenue KPIs ──
  @Column({ type: 'int', default: 0 })
  arpu: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  churnRate: number;

  @Column({ type: 'bigint', default: 0 })
  totalThisMonth: number;

  // ── Match Health KPIs ──
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  matchRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  conversationRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  replyRate: number;

  @CreateDateColumn()
  createdAt: Date;
}
