// apps/server/src/growth/controllers/monetization.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { MonetizationService } from '../services/monetization.service';

@Controller('growth/monetization')
@UseGuards(JwtAuthGuard)
export class MonetizationController {
  constructor(private readonly service: MonetizationService) {}

  @Post('predict')
  predict(
    @Body() body: { userId: number; features: any; candidates: string[] },
  ) {
    return this.service.predict(body.userId, body.features, body.candidates);
  }

  @Post('feedback')
  feedback(
    @Body()
    body: {
      userId: number;
      variant: string;
      features: any;
      label: number;
    },
  ) {
    return this.service.sendFeedback(body);
  }

  @Get('feedback-count')
  feedbackCount() {
    return this.service.getFeedbackCount();
  }

  @Post('retrain')
  retrain() {
    return this.service.retrain();
  }

  @Post('train')
  train() {
    return this.service.train();
  }
}
