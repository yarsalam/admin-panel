// apps/server/src/growth/controllers/social.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { SocialService } from '../services/social.service';

@Controller('growth/social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly service: SocialService) {}

  @Post('scan-telegram')
  scanTelegram() {
    return this.service.scanTelegram();
  }

  @Get('brand-sentiment')
  getBrandSentiment(@Query('brand') brand: string) {
    return this.service.getBrandSentiment(brand);
  }

  @Post('analyze-texts')
  analyzeTexts(@Body() texts: string[]) {
    return this.service.analyzeTexts(texts);
  }
}
