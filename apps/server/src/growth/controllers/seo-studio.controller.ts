// apps/server/src/growth/controllers/seo-studio.controller.ts
import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { SeoStudioService } from '../services/seo-studio.service';

@Controller('growth/seo-studio')
@UseGuards(JwtAuthGuard)
export class SeoStudioController {
  constructor(private readonly service: SeoStudioService) {}

  @Get('content-ideas')
  getContentIdeas() {
    return this.service.getContentIdeas();
  }

  @Get('high-intent-content')
  getHighIntentContent() {
    return this.service.getHighIntentContent();
  }

  @Get('behavioral-keywords')
  getBehavioralKeywords() {
    return this.service.getBehavioralKeywords();
  }

  @Get('keyword-rankings')
  getKeywordRankings(@Query('keyword') keyword: string) {
    return this.service.getKeywordRankings(keyword);
  }

  @Get('serp-features')
  getSERPFeatures(@Query('keyword') keyword: string) {
    return this.service.getSERPFeatures(keyword);
  }

  @Get('competitor-analysis')
  getCompetitorAnalysis() {
    return this.service.getCompetitorAnalysis();
  }

  @Get('competitor-changes')
  getCompetitorChanges() {
    return this.service.getCompetitorChanges();
  }

  @Get('ai-recommendations')
  getAIRecommendations() {
    return this.service.getAIRecommendations();
  }

  @Get('google-trends')
  getGoogleTrends(
    @Query('keyword') keyword: string,
    @Query('geo') geo: string,
  ) {
    return this.service.getGoogleTrends(keyword, geo);
  }

  @Post('keyword-gap')
  getKeywordGap(@Body() body: { domain: string; competitors: string[] }) {
    return this.service.getKeywordGap(body.domain, body.competitors);
  }
}
