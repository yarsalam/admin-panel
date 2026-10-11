import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminAuthService } from './auth.service';
import { AdminAuthController } from './auth.controller';
import { AdminUser } from './entities/admin-user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'super-secret',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, JwtStrategy, SeederService],
  exports: [JwtModule],
})
export class AdminAuthModule implements OnModuleInit {
  constructor(private adminAuthService: AdminAuthService) {}

  onModuleInit() {
    this.adminAuthService.createInitialAdmin();
  }
}
