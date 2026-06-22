import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendSetupEmail(to: string, token: string): Promise<void> {
    const frontUrl = this.configService.get<string>('FRONT_URL');
    const from = this.configService.get<string>('MAIL_FROM');
    const link = `${frontUrl}/admin/set-password?token=${token}`;

    await this.transporter.sendMail({
      from,
      to,
      subject: 'تنظیم رمز عبور پنل مدیریت',
      html: `
        <p>برای تنظیم رمز عبور خود روی لینک زیر کلیک کنید:</p>
        <a href="${link}">${link}</a>
        <p>این لینک ۲۴ ساعت اعتبار دارد.</p>
      `,
    });
  }
}
