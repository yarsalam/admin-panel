import { Module } from '@nestjs/common';
import { SystemHealthController } from './controllers/system-health.controller';
import { SystemHealthService } from './services/system-health.service';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';

@Module({
  imports: [UserApiClientModule],
  controllers: [SystemHealthController],
  providers: [SystemHealthService],
})
export class InfrastructureModule {}
