import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { SeoStudioService } from '../services/seo-studio.service';

@Controller('growth/seo-studio')
@UseGuards(JwtAuthGuard)
export class SeoStudioController {
  constructor(private readonly service: SeoStudioService) {}

  @Get('content-ideas')
  getContentIdeas() { return this.service.getContentIdeas(); }

  @Get('high-intent-content')
  getHighIntentContent() { return this.service.getContentIdeas(); }

  @Get('acquisition')
  getAcquisition(@Query('days') days?: string) {
    return this.service.getAcquisition(days === undefined ? 30 : Number(days));
  }

  @Get('health-summary')
  getHealthSummary() { return this.service.getHealthSummary(); }
}
