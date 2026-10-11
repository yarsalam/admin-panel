import { Module } from '@nestjs/common';
import { AiOpsController } from './controllers/ai-ops.controller';
import { AiOpsService } from './services/ai-ops.service';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';

@Module({
  imports: [UserApiClientModule],
  controllers: [AiOpsController],
  providers: [AiOpsService],
})
export class AiOpsModule {}
