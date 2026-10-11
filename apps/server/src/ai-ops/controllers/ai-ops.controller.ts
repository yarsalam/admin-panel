import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { AiOpsService } from '../services/ai-ops.service';

@Controller('ai-ops')
@UseGuards(JwtAuthGuard)
export class AiOpsController {
  constructor(private readonly aiOpsService: AiOpsService) {}

  @Get('overview')
  getOverview() {
    return this.aiOpsService.getOverview();
  }
}
