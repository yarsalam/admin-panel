import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { FeedSimulatorService } from '../services/feed-simulator.service';

@Controller('product/feed-simulator')
@UseGuards(JwtAuthGuard)
export class FeedSimulatorController {
  constructor(private service: FeedSimulatorService) {}
  @Get()
  getFeed(
    @Query('userId') userId: number,
    @Query('limit') limit?: number,
    @Query('city') city?: string,
  ) {
    return this.service.simulateFeed(userId, { limit, city });
  }
  @Post('analyze-image')
  analyzeImage(@Body('url') url: string) {
    return this.service.analyzeImage(url);
  }
}
