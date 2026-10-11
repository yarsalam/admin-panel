import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './admin/database/database.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { AdminUsersModule } from './admin/users/users.module';
import { ExecutiveModule } from './executive/executive.module';
import { ProductModule } from './product/product.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { CeoModule } from './ceo/ceo.module'; // ← اضافه شد
import { ScheduleModule } from '@nestjs/schedule';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AiOpsModule } from './ai-ops/ai-ops.module'; // 🆕
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AdminAuthModule,
    AdminUsersModule,
    ExecutiveModule,
    ProductModule,
    SafetyModule,
    GrowthModule,
    CeoModule,
    InfrastructureModule,
    AiOpsModule,
    UsersModule,
    HttpModule,
  ],
})
export class AppModule {}
