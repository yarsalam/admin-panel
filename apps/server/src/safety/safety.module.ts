import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { UsersController } from './controllers/users.controller';
import { TicketsController } from './controllers/tickets.controller';
import { ModerationController } from './controllers/moderation.controller';
import { ReportsController } from './controllers/reports.controller';
import { UsersService } from './services/users.service';
import { TicketsService } from './services/tickets.service';
import { ModerationService } from './services/moderation.service';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [HttpModule, UserApiClientModule],
  controllers: [
    UsersController,
    TicketsController,
    ModerationController,
    ReportsController,
  ],
  providers: [UsersService, TicketsService, ModerationService, ReportsService],
})
export class SafetyModule {}
