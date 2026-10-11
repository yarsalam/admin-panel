import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';

import { UsersController } from './controllers/users.controller';
import { TicketsController } from './controllers/tickets.controller';
import { ModerationController } from './controllers/moderation.controller';
import { ReportsController } from './controllers/reports.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { RiskController } from './controllers/risk.controller';

import { UsersService } from './services/users.service';
import { TicketsService } from './services/tickets.service';
import { ModerationService } from './services/moderation.service';
import { ReportsService } from './services/reports.service';
import { DashboardService } from './services/dashboard.service';
import { RiskService } from './services/risk.service';
import { UserDetailController } from './controllers/user-detail.controller';
import { UserDetailService } from './services/user-detail.service';

@Module({
  imports: [HttpModule, UserApiClientModule],
  controllers: [
    UsersController,
    TicketsController,
    ModerationController,
    ReportsController,
    DashboardController,
    RiskController,
    UserDetailController,
  ],
  providers: [
    UsersService,
    TicketsService,
    ModerationService,
    ReportsService,
    DashboardService,
    RiskService,
    UserDetailService,
  ],
})
export class SafetyModule {}
