import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/common/guards/jwt-auth.guard';
import { OperationalScoreService } from '../services/operational-score.service';
import { RecommendationEngineService } from '../services/recommendation-engine.service';
import { DecisionTrackerService } from '../services/decision-tracker.service';

@Controller('exec/intelligence')
@UseGuards(JwtAuthGuard)
export class CommandCenterController {
  constructor(
    private scoreService: OperationalScoreService,
    private recEngine: RecommendationEngineService,
    private decisionTracker: DecisionTrackerService,
  ) {}

  @Get('business-score')
  businessScore() {
    return this.scoreService.getBusinessScore();
  }

  @Get('top-recommendations')
  topRecommendations() {
    return this.recEngine.getTopRecommendations();
  }

  // داشبورد یکپارچه برای CEO — یک endpoint همه چیز را می‌آورد
  @Get('summary')
  async summary() {
    const [score, recommendations, accuracy] = await Promise.allSettled([
      this.scoreService.getBusinessScore(),
      this.recEngine.getTopRecommendations(),
      this.decisionTracker.getAccuracyStats(),
    ]);

    return {
      score: score.status === 'fulfilled' ? score.value : null,
      topRecommendations:
        recommendations.status === 'fulfilled'
          ? recommendations.value.slice(0, 5)
          : [],
      decisionAccuracy: accuracy.status === 'fulfilled' ? accuracy.value : null,
      timestamp: new Date().toISOString(),
    };
  }
}
