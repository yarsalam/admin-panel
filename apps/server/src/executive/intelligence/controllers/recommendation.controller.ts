import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/common/guards/jwt-auth.guard';
import { RecommendationEngineService } from '../services/recommendation-engine.service';

@Controller('exec/intelligence/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private recEngine: RecommendationEngineService) {}

  @Get()
  list() {
    return this.recEngine.getTopRecommendations();
  }
}
