import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<AdminUser> {
    const user = await this.adminUserRepo.findOne({ where: { email } });

    // رفع باگ: بررسی null بودن passwordHash قبل از compare
    if (!user || !user.passwordHash || !user.isActive) {
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

}
