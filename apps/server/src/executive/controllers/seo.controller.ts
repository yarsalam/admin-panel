import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { SeoService } from '../services/seo.service';

@Controller('exec/seo')
@UseGuards(JwtAuthGuard)
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('keywords') getKeywordsRanking() {
    return this.seoService.getKeywordsRanking();
  }
  @Get('opportunities') getContentOpportunities() {
    return this.seoService.getContentOpportunities();
  }
  @Get('competitors') getCompetitors() {
    return this.seoService.getCompetitorAnalysis();
  }
  @Get('recommendations') getRecommendations() {
    return this.seoService.getSelfLearningRecommendations();
  }
  @Get('serp-features') getSERPFeatures(@Query('keyword') keyword: string) {
    return this.seoService.getSERPFeatures(keyword);
  }
}
