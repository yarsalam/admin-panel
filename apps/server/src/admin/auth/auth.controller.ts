import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AdminUser } from './entities/admin-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
    private adminAuthService: AdminAuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.adminAuthService.validateUser(
      body.email,
      body.password,
    );
    return this.adminAuthService.login(user);
  }

  @Post('setup-password')
  async setupPassword(@Body() body: { token: string; password: string }) {
    let payload: { email: string; purpose: string };
    try {
      payload = this.jwtService.verify(body.token);
    } catch {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده');
    }
    if (payload.purpose !== 'setup') throw new UnauthorizedException();

    const user = await this.adminUserRepo.findOne({
      where: { email: payload.email },
    });
    if (!user || user.setupToken !== body.token) {
      throw new UnauthorizedException('توکن قبلاً استفاده شده');
    }

    user.passwordHash = await bcrypt.hash(body.password, 12);
    user.isActive = true;
    user.isVerified = true;
    user.setupToken = null;
    await this.adminUserRepo.save(user);

    return this.adminAuthService.login(user);
  }
}
