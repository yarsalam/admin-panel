import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/common/guards/jwt-auth.guard';
import { DecisionTrackerService } from '../services/decision-tracker.service';
import { Recommendation } from '../interfaces/recommendation.interface';

@Controller('exec/intelligence/decisions')
@UseGuards(JwtAuthGuard)
export class DecisionTrackerController {
  constructor(private decisionService: DecisionTrackerService) {}

  // رفع باگ: دریافت کل recommendation در body
  @Post('accept')
  accept(@Body() body: { recommendation: Recommendation; notes?: string }) {
    return this.decisionService.accept(body.recommendation, body.notes);
  }

  @Post('implement')
  implement(@Body() body: { decisionId: number; notes?: string }) {
    return this.decisionService.markImplemented(body.decisionId, body.notes);
  }

  @Post('measure')
  measure(@Body() body: { decisionId: number; actualImpact: number }) {
    return this.decisionService.measure(body.decisionId, body.actualImpact);
  }

  @Get()
  list() {
    return this.decisionService.getAll();
  }

  @Get('accuracy')
  accuracy() {
    return this.decisionService.getAccuracyStats();
  }
}
