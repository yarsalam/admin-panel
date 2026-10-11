import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'admin' })
  role: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  setupToken: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
