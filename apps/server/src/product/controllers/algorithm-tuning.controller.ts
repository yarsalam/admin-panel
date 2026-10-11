import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { AlgorithmTuningService } from '../services/algorithm-tuning.service';

@Controller('product/algorithm-tuning')
@UseGuards(JwtAuthGuard)
export class AlgorithmTuningController {
  constructor(private service: AlgorithmTuningService) {}

  @Get('phase-weights')
  getPhaseWeights() {
    return this.service.getPhaseWeights();
  }

  @Post('phase-weights')
  setPhaseWeight(@Body() body: { key: string; value: number }) {
    return this.service.setPhaseWeight(body.key, body.value);
  }

  @Get('feature-weights')
  getFeatureWeights(@Query('type') type: string) {
    return this.service.getFeatureWeights(type);
  }

  @Post('feature-weights')
  updateFeatureWeight(
    @Body() body: { type: string; index: number; value: number },
  ) {
    return this.service.updateFeatureWeight(body.type, body.index, body.value);
  }

  @Get('diversity')
  getDiversityParams() {
    return this.service.getDiversityParams();
  }

  @Post('diversity')
  updateDiversityParams(@Body() params: any) {
    return this.service.updateDiversityParams(params);
  }

  @Post('test-scores')
  testScores(@Body() body: { userId: number; candidateIds: number[] }) {
    return this.service.testScores(body.userId, body.candidateIds);
  }

  @Get('user-features')
  getUserFeatures(@Query('userId', ParseIntPipe) userId: number) {
    return this.service.getUserFeatures(userId);
  }
}
