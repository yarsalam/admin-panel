import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoleDefaultPermissions } from './role-permissions';

@Injectable()
export class AdminAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<AdminUser> {
    const user = await this.adminUserRepo.findOne({ where: { email } });

    // رفع باگ: بررسی null بودن passwordHash قبل از compare
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: AdminUser) {
    const permissions = Array.isArray(user.permissions)
      ? user.permissions
      : typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : [];

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async onModuleInit() {
    await this.createInitialAdmin();
  }

  async createInitialAdmin() {
    const existingSuperAdmin = await this.adminUserRepo.findOne({
      where: { role: 'superadmin' },
    });
    if (existingSuperAdmin) return;

    const email = this.configService
      .get<string>('INITIAL_ADMIN_EMAIL')
      ?.trim()
      .toLowerCase();
    const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');

    if (!email || !password) {
      throw new Error(
        'Initial superadmin is missing. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD for the first startup.',
      );
    }
    if (password.length < 16) {
      throw new Error('INITIAL_ADMIN_PASSWORD must contain at least 16 characters.');
    }

    const existingEmail = await this.adminUserRepo.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error(
        'INITIAL_ADMIN_EMAIL already belongs to a non-superadmin account; choose a different bootstrap email.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.adminUserRepo.save(
      this.adminUserRepo.create({
        email,
        passwordHash,
        role: 'superadmin',
        permissions: RoleDefaultPermissions.superadmin,
        isActive: true,
        isVerified: true,
        setupToken: null,
      }),
    );
  }
}
