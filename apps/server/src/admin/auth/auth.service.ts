import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RoleDefaultPermissions } from './role-permissions';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
    private jwtService: JwtService,
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

  async createInitialAdmin() {
    const exists = await this.adminUserRepo.findOne({
      where: { email: 'admin@yarsalam.com' },
    });
    if (!exists) {
      const hash = await bcrypt.hash('Admin123!', 12);
      await this.adminUserRepo.save(
        this.adminUserRepo.create({
          email: 'admin@yarsalam.com',
          passwordHash: hash,
          role: 'superadmin',
          permissions: RoleDefaultPermissions['superadmin'],
        }),
      );
    }
  }
}
