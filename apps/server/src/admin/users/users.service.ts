import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../common/mail/mail.service';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async create(data: { email: string; role: string; permissions?: string[] }) {
    const exists = await this.adminUserRepo.findOne({
      where: { email: data.email },
    });
    if (exists) throw new ConflictException('این ایمیل قبلاً ثبت شده');

    const setupToken = this.jwtService.sign(
      { email: data.email, purpose: 'setup' },
      { expiresIn: '24h' },
    );

    const user = this.adminUserRepo.create({
      email: data.email,
      role: data.role,
      permissions: data.permissions || [],
      isActive: false,
      isVerified: false,
      setupToken,
    });
    await this.adminUserRepo.save(user);

    await this.mailService.sendSetupEmail(data.email, setupToken);
    return { message: 'ایمیل تنظیم رمز عبور ارسال شد' };
  }

  async findAll() {
    return this.adminUserRepo.find({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
