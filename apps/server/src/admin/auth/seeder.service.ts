import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { RoleDefaultPermissions } from './role-permissions';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedInitialAdmin();
  }

  private async seedInitialAdmin() {
    const email = this.configService
      .get<string>('INITIAL_ADMIN_EMAIL')
      ?.trim()
      .toLowerCase();
    const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');

    // Never create public, predictable default accounts. Configure these values
    // explicitly for the first deployment, then remove them from the environment.
    if (!email || !password) {
      this.logger.warn(
        'Initial admin was not seeded. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to create it.',
      );
      return;
    }

    if (password.length < 16) {
      this.logger.error(
        'Initial admin was not seeded: INITIAL_ADMIN_PASSWORD must be at least 16 characters.',
      );
      return;
    }

    const existing = await this.adminUserRepo.findOne({ where: { email } });
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    await this.adminUserRepo.save(
      this.adminUserRepo.create({
        email,
        passwordHash,
        role: 'superadmin',
        permissions: RoleDefaultPermissions['superadmin'] || [],
        isActive: true,
        isVerified: true,
        setupToken: null,
      }),
    );

    this.logger.warn(
      `Seeded initial superadmin account for ${email}. Remove INITIAL_ADMIN_PASSWORD from the environment after setup.`,
    );
  }
}
