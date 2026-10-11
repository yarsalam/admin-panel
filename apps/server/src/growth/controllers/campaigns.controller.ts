// apps/server/src/growth/controllers/campaigns.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { CampaignsService } from '../services/campaigns.service';

@Controller('growth/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get('analyze')
  analyze() {
    return this.service.analyze();
  }

  @Get('ltv-by-source')
  ltvBySource() {
    return this.service.ltvBySource();
  }

  @Post('forecast')
  forecast(@Body() body: { historicalData: any[]; days?: number }) {
    return this.service.forecast(body.historicalData, body.days);
  }

  @Post('feedback')
  sendFeedback(@Body() body: any) {
    return this.service.sendFeedback(body);
  }
}
