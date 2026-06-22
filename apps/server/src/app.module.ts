import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './admin/database/database.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { AdminUsersModule } from './admin/users/users.module';
import { ExecutiveModule } from './executive/executive.module';
import { ProductModule } from './product/product.module';
import { SafetyModule } from './safety/safety.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AdminAuthModule,
    AdminUsersModule,
    ExecutiveModule,
    ProductModule, // رفع باگ: ایمپورت مفقود
    SafetyModule, // رفع باگ: ایمپورت مفقود
  ],
})
export class AppModule {}
