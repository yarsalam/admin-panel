// users.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // ← اضافه کن
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { UsersIntelligenceController } from './controllers/users-intelligence.controller';
import { UsersIntelligenceService } from './services/users-intelligence.service';
import { UsersController } from 'src/safety/controllers/users.controller';
import { UsersService } from 'src/safety/services/users.service';

@Module({
  imports: [
    UserApiClientModule,
    HttpModule, // ← اضافه کن
  ],
  controllers: [UsersController, UsersIntelligenceController],
  providers: [UsersService, UsersIntelligenceService],
})
export class UsersModule {}
