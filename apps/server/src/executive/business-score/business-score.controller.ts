import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { BusinessScoreService } from './business-score.service';

@Controller('exec/business-score')
@UseGuards(JwtAuthGuard)
export class BusinessScoreController {
  constructor(private readonly service: BusinessScoreService) {}

  // فقط خواندنی — هیچ Writeای انجام نمیشه
  @Get('deltas')
  async getDeltas() {
    return this.service.getAllDeltas();
  }

  // Write فقط با POST (یا Cron)
  @Post('snapshot')
  async saveSnapshot() {
    await this.service.saveTodaysSnapshot();
    return { success: true };
  }
}
