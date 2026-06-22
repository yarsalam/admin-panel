import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recommendation } from '../interfaces/recommendation.interface';

@Entity('decision_records')
export class DecisionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recommendationId: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  sourceDomain: string;

  @Column({ type: 'float', default: 0 })
  expectedImpact: number;

  @Column({ length: 20, default: 'pending' })
  status: 'pending' | 'accepted' | 'implemented' | 'measured';

  @Column({ type: 'text', nullable: true })
  implementationNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  implementedAt: Date;

  @Column({ type: 'float', nullable: true })
  actualImpact: number;

  // رفع باگ: ذخیره کامل snapshot توصیه
  @Column({ type: 'json', nullable: true })
  recommendationSnapshot: Recommendation;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
