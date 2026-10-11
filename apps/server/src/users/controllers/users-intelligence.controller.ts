import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { UsersIntelligenceService } from '../services/users-intelligence.service';

@Controller('users/intelligence')
@UseGuards(JwtAuthGuard)
export class UsersIntelligenceController {
  constructor(private readonly service: UsersIntelligenceService) {}

  @Get('churn-summary')
  getChurnSummary() {
    return this.service.getChurnSummary();
  }

  @Get('at-risk')
  getAtRiskUsers(
    @Query('threshold') threshold?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getAtRiskUsers(
      Number(threshold) || 0.7,
      Number(limit) || 100,
    );
  }

  @Get('cohorts')
  getCohorts(@Query('weeks') weeks?: string) {
    return this.service.getCohorts(Number(weeks) || 8);
  }

  @Get('time-to-first-match')
  getTimeToFirstMatch(@Query('days') days?: string) {
    return this.service.getTimeToFirstMatch(Number(days) || 30);
  }

  @Get('time-to-first-conversation')
  getTimeToFirstConversation(@Query('days') days?: string) {
    return this.service.getTimeToFirstConversation(Number(days) || 30);
  }
}
