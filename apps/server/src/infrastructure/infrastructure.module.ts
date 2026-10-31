import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SystemHealthController } from './controllers/system-health.controller';
import { AiPackControlController } from './controllers/ai-pack-control.controller';
import { SystemHealthService } from './services/system-health.service';
import { AiPackControlService } from './services/ai-pack-control.service';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { RolesGuard } from '../admin/common/guards/roles.guard';

@Module({
  imports: [UserApiClientModule, HttpModule],
  controllers: [SystemHealthController, AiPackControlController],
  providers: [SystemHealthService, AiPackControlService, RolesGuard],
})
export class InfrastructureModule {}
