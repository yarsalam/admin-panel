import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { RoleDefaultPermissions } from './role-permissions';

const defaultUsers = [
  { email: 'admin@yarsalam.com', password: 'Admin123!', role: 'superadmin' },
  { email: 'support@yarsalam.com', password: 'Support123!', role: 'support' },
  {
    email: 'marketing@yarsalam.com',
    password: 'Marketing123!',
    role: 'marketing',
  },
  { email: 'product@yarsalam.com', password: 'Product123!', role: 'product' },
];

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    for (const user of defaultUsers) {
      const existing = await this.adminUserRepo.findOne({
        where: { email: user.email },
      });
      if (!existing) {
        const hash = await bcrypt.hash(user.password, 12);
        const perms = RoleDefaultPermissions[user.role] || [];
        await this.adminUserRepo.save(
          this.adminUserRepo.create({
            email: user.email,
            passwordHash: hash,
            role: user.role,
            permissions: perms,
            isActive: true,
            isVerified: true,
            setupToken: null,
          }),
        );
        this.logger.log(`Seeded ${user.role}: ${user.email}`);
      }
    }
  }
}
